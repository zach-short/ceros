package handlers

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"github.com/zach-short/final-web-programming/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

/* RequestFriend */
/* AddFriend */
/* RemoveFriend */
/* GetFriendship */
/* GetFriendships */
/* GetPendingRequests */
/* GetSentRequests */
/* RejectFriend */
/* BlockUser */
/* UnblockUser */

func RequestFriend(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var req struct {
		AddresseeID string `json:"addresseeId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	addresseeID, err := primitive.ObjectIDFromHex(req.AddresseeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid addressee ID"})
		return
	}

	if userID == addresseeID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot send friend request to yourself"})
		return
	}

	existingQuery := bson.M{
		"$or": []bson.M{
			{"requesterId": userID, "addresseeId": addresseeID},
			{"requesterId": addresseeID, "addresseeId": userID},
		},
	}

	existing, _ := utils.FetchItem(existingQuery, "Friendship")
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "friendship already exists"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	friendship := models.Friendship{
		ID:          primitive.NewObjectID(),
		RequesterID: userID,
		AddresseeID: addresseeID,
		Status:      models.FriendStatusPending,
		RequestedAt: time.Now(),
	}

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Friendship")
	_, err = friendCollection.InsertOne(ctx, friendship)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send friend request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "friend request sent", "friendship": friendship})
}

func AddFriend(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	friendshipId := c.Param("friendshipId")
	friendshipID, err := primitive.ObjectIDFromHex(friendshipId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid friendship ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := bson.M{
		"_id":         friendshipID,
		"addresseeId": userID,
		"status":      models.FriendStatusPending,
	}

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"status":      models.FriendStatusAccepted,
			"respondedAt": now,
		},
	}

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Friendship")
	result := friendCollection.FindOneAndUpdate(ctx, query, update)
	if result.Err() != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "pending friend request not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "friend request accepted"})
}

func RemoveFriend(c *gin.Context) {
	friendshipId := c.Param("friendshipId")

	friendshipID, err := primitive.ObjectIDFromHex(friendshipId)
	if err != nil {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": "with id"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Listing")
	var friend models.Friendship
	err = friendCollection.FindOneAndDelete(ctx, bson.M{"_id": friendshipID}).Decode(&friend)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "in deletion"})
	}

	c.JSON(http.StatusOK, gin.H{"message": "friend deleted"})

}

func GetPendingRequests(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	query := bson.M{
		"addresseeId": userID,
		"status":      models.FriendStatusPending,
	}

	requests, err := utils.FetchItems(query, "Friendship")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding pending requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pendingRequests": requests})
}

func GetSentRequests(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	query := bson.M{
		"requesterId": userID,
		"status":      models.FriendStatusPending,
	}

	requests, err := utils.FetchItems(query, "Friendship")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding sent requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sentRequests": requests})
}

func RejectFriend(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	friendshipId := c.Param("friendshipId")
	friendshipID, err := primitive.ObjectIDFromHex(friendshipId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid friendship ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := bson.M{
		"_id":         friendshipID,
		"addresseeId": userID,
		"status":      models.FriendStatusPending,
	}

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Friendship")
	var friendship models.Friendship
	err = friendCollection.FindOneAndDelete(ctx, query).Decode(&friendship)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "pending friend request not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "friend request rejected"})
}

func BlockUser(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var req struct {
		BlockedUserID string `json:"blockedUserId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	blockedUserID, err := primitive.ObjectIDFromHex(req.BlockedUserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid blocked user ID"})
		return
	}

	if userID == blockedUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot block yourself"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	existingQuery := bson.M{
		"$or": []bson.M{
			{"requesterId": userID, "addresseeId": blockedUserID},
			{"requesterId": blockedUserID, "addresseeId": userID},
		},
	}

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Friendship")

	update := bson.M{
		"$set": bson.M{
			"status":      models.FriendStatusBlocked,
			"respondedAt": time.Now(),
		},
	}

	result := friendCollection.FindOneAndUpdate(ctx, existingQuery, update)
	if result.Err() != nil {
		friendship := models.Friendship{
			ID:          primitive.NewObjectID(),
			RequesterID: userID,
			AddresseeID: blockedUserID,
			Status:      models.FriendStatusBlocked,
			RequestedAt: time.Now(),
			RespondedAt: &[]time.Time{time.Now()}[0],
		}

		_, err = friendCollection.InsertOne(ctx, friendship)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to block user"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "user blocked"})
}

func UnblockUser(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	friendshipId := c.Param("friendshipId")
	friendshipID, err := primitive.ObjectIDFromHex(friendshipId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid friendship ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := bson.M{
		"_id":    friendshipID,
		"status": models.FriendStatusBlocked,
		"$or": []bson.M{
			{"requesterId": userID},
			{"addresseeId": userID},
		},
	}

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Friendship")
	var friendship models.Friendship
	err = friendCollection.FindOneAndDelete(ctx, query).Decode(&friendship)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "blocked relationship not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user unblocked"})
}

func GetFriendship(c *gin.Context) {
	friendshipId := c.Param("friendshipId")

	friendshipID, err := primitive.ObjectIDFromHex(friendshipId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "with friend id"})
		return
	}

	query := bson.M{"_id": friendshipID, "status": models.FriendStatusAccepted}

	friendship, err := utils.FetchItem(query, "Friendship")
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "finding friend"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"friendship": friendship})
}

func GetFriendships(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	query := bson.M{
		"$and": []bson.M{
			{"status": models.FriendStatusAccepted},
			{
				"$or": []bson.M{
					{"requesterId": userID},
					{"addresseeId": userID},
				},
			},
		},
	}

	friendships, err := utils.FetchItems(query, "Friendship")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding friendships"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"friendships": friendships})
}
