package handlers

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"github.com/zach-short/final-web-programming/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	existing, _ := utils.FetchItem(existingQuery, "friendships")
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "friendship already exists"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var addressee models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": addresseeID}).Decode(&addressee)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "addressee user not found"})
		return
	}

	var friendship models.Friendship
	now := time.Now()

	if addressee.Settings.AutoAcceptFriendInvitations {
		friendship = models.Friendship{
			ID:          primitive.NewObjectID(),
			RequesterID: userID,
			AddresseeID: addresseeID,
			Status:      models.FriendStatusAccepted,
			RequestedAt: now,
			RespondedAt: &now,
		}
	} else {
		friendship = models.Friendship{
			ID:          primitive.NewObjectID(),
			RequesterID: userID,
			AddresseeID: addresseeID,
			Status:      models.FriendStatusPending,
			RequestedAt: now,
		}
	}

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")
	_, err = friendCollection.InsertOne(ctx, friendship)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send friend request"})
		return
	}

	message := "friend request sent"
	if addressee.Settings.AutoAcceptFriendInvitations {
		message = "friend request automatically accepted"
	}

	c.JSON(http.StatusCreated, gin.H{"message": message, "friendship": friendship})
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

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")
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

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")
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

	requests, err := utils.FetchItems(query, "friendships")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding pending requests"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")

	var enrichedRequests []map[string]any
	for _, request := range requests {
		requesterID := request["requesterId"].(primitive.ObjectID)

		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"_id": requesterID}).Decode(&user)
		if err != nil {
			continue
		}

		enrichedRequest := map[string]any{
			"id":          request["_id"],
			"requesterId": request["requesterId"],
			"addresseeId": request["addresseeId"],
			"status":      request["status"],
			"requestedAt": request["requestedAt"],
			"respondedAt": request["respondedAt"],
			"user": map[string]any{
				"id":      user.ID.Hex(),
				"name":    user.Name,
				"email":   user.Email,
				"picture": user.Picture,
			},
		}

		enrichedRequests = append(enrichedRequests, enrichedRequest)
	}

	c.JSON(http.StatusOK, gin.H{"pendingRequests": enrichedRequests})
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

	requests, err := utils.FetchItems(query, "friendships")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding sent requests"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")

	var enrichedRequests []map[string]any
	for _, request := range requests {
		addresseeID := request["addresseeId"].(primitive.ObjectID)

		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"_id": addresseeID}).Decode(&user)
		if err != nil {
			continue
		}

		enrichedRequest := map[string]any{
			"id":          request["_id"],
			"requesterId": request["requesterId"],
			"addresseeId": request["addresseeId"],
			"status":      request["status"],
			"requestedAt": request["requestedAt"],
			"respondedAt": request["respondedAt"],
			"user": map[string]any{
				"id":      user.ID.Hex(),
				"name":    user.Name,
				"email":   user.Email,
				"picture": user.Picture,
			},
		}

		enrichedRequests = append(enrichedRequests, enrichedRequest)
	}

	c.JSON(http.StatusOK, gin.H{"sentRequests": enrichedRequests})
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

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")
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

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")

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

	friendCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")
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

	friendship, err := utils.FetchItem(query, "friendships")
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

	// Parse pagination parameters
	cursorStr := c.Query("cursor")
	limitStr := c.DefaultQuery("limit", "100")
	limit := 100
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 200 {
		limit = l
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build query with pagination
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

	// Add cursor for pagination
	if cursorStr != "" {
		cursorID, err := primitive.ObjectIDFromHex(cursorStr)
		if err == nil {
			query["_id"] = bson.M{"$gt": cursorID}
		}
	}

	friendshipCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("friendships")

	// Fetch limit+1 to determine if there are more results
	findOptions := options.Find().
		SetLimit(int64(limit + 1)).
		SetSort(bson.D{{Key: "_id", Value: 1}})

	cursor, err := friendshipCollection.Find(ctx, query, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding friendships"})
		return
	}
	defer cursor.Close(ctx)

	var friendships []models.Friendship
	if err = cursor.All(ctx, &friendships); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decoding friendships"})
		return
	}

	// Check if there are more results
	hasMore := len(friendships) > limit
	if hasMore {
		friendships = friendships[:limit]
	}

	// Determine next cursor
	var nextCursor string
	if hasMore && len(friendships) > 0 {
		nextCursor = friendships[len(friendships)-1].ID.Hex()
	}

	// Collect user IDs for batch fetch
	var userIDs []primitive.ObjectID
	for _, friendship := range friendships {
		if friendship.RequesterID == userID {
			userIDs = append(userIDs, friendship.AddresseeID)
		} else {
			userIDs = append(userIDs, friendship.RequesterID)
		}
	}

	// Batch fetch all users
	userCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	userCursor, err := userCollection.Find(ctx, bson.M{"_id": bson.M{"$in": userIDs}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding users"})
		return
	}
	defer userCursor.Close(ctx)

	var users []models.User
	if err = userCursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decoding users"})
		return
	}

	// Build user map for O(1) lookup
	userMap := make(map[primitive.ObjectID]models.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	// Enrich friendships with user info
	var enrichedFriendships []map[string]any
	for _, friendship := range friendships {
		var otherUserID primitive.ObjectID
		if friendship.RequesterID == userID {
			otherUserID = friendship.AddresseeID
		} else {
			otherUserID = friendship.RequesterID
		}

		user, exists := userMap[otherUserID]
		if !exists {
			continue
		}

		settings := user.Settings
		if settings == (models.UserSettings{}) {
			settings = models.GetDefaultUserSettings()
		}

		userInfo := map[string]any{
			"id":   user.ID.Hex(),
			"name": user.Name,
		}

		if settings.Privacy.ShowPicture || true {
			userInfo["picture"] = user.Picture
		}
		if settings.Privacy.ShowGivenName || true {
			userInfo["givenName"] = user.GivenName
		}
		if settings.Privacy.ShowFamilyName || true {
			userInfo["familyName"] = user.FamilyName
		}
		if settings.Privacy.ShowEmail {
			userInfo["email"] = user.Email
		}

		enrichedFriendship := map[string]any{
			"id":          friendship.ID.Hex(),
			"requesterId": friendship.RequesterID.Hex(),
			"addresseeId": friendship.AddresseeID.Hex(),
			"status":      friendship.Status,
			"requestedAt": friendship.RequestedAt,
			"respondedAt": friendship.RespondedAt,
			"user":        userInfo,
		}

		enrichedFriendships = append(enrichedFriendships, enrichedFriendship)
	}

	c.JSON(http.StatusOK, gin.H{
		"friendships": enrichedFriendships,
		"nextCursor":  nextCursor,
		"hasMore":     hasMore,
	})
}

func SearchUsers(c *gin.Context) {
	searchTerm := c.Query("search")
	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search term is required"})
		return
	}

	userId := c.GetString("userID")
	currentUserID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	// Parse pagination parameters
	cursorStr := c.Query("cursor")
	limitStr := c.DefaultQuery("limit", "100")
	limit := 100
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 200 {
		limit = l
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build search query with text search
	query := bson.M{
		"$text": bson.M{
			"$search": searchTerm,
		},
		"isDeleted": bson.M{"$ne": true},
	}

	// Add cursor for pagination
	if cursorStr != "" {
		cursorID, err := primitive.ObjectIDFromHex(cursorStr)
		if err == nil {
			query["_id"] = bson.M{"$gt": cursorID}
		}
	}

	userCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")

	// Fetch limit+1 to determine if there are more results
	findOptions := options.Find().
		SetLimit(int64(limit + 1)).
		SetSort(bson.D{{Key: "score", Value: bson.M{"$meta": "textScore"}}, {Key: "_id", Value: 1}}).
		SetProjection(bson.M{"score": bson.M{"$meta": "textScore"}})

	cursor, err := userCollection.Find(ctx, query, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search users"})
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode users"})
		return
	}

	// Check if there are more results
	hasMore := len(users) > limit
	if hasMore {
		users = users[:limit]
	}

	// Determine next cursor
	var nextCursor string
	if hasMore && len(users) > 0 {
		nextCursor = users[len(users)-1].ID.Hex()
	}

	var userIDs []primitive.ObjectID
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}

	// Fetch friendship statuses
	friendshipQuery := bson.M{
		"$or": []bson.M{
			{
				"requesterId": currentUserID,
				"addresseeId": bson.M{"$in": userIDs},
			},
			{
				"addresseeId": currentUserID,
				"requesterId": bson.M{"$in": userIDs},
			},
		},
	}

	friendships, err := utils.FetchItems(friendshipQuery, "friendships")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch friendship statuses"})
		return
	}

	statusMap := make(map[primitive.ObjectID]map[string]any)
	for _, friendship := range friendships {
		var otherUserID primitive.ObjectID

		requesterID := friendship["requesterId"].(primitive.ObjectID)
		addresseeID := friendship["addresseeId"].(primitive.ObjectID)

		if requesterID == currentUserID {
			otherUserID = addresseeID
		} else {
			otherUserID = requesterID
		}

		status := friendship["status"].(string)
		isPendingFromMe := requesterID == currentUserID && status == "pending"
		isPendingToMe := addresseeID == currentUserID && status == "pending"

		statusMap[otherUserID] = map[string]any{
			"status":          status,
			"isPendingFromMe": isPendingFromMe,
			"isPendingToMe":   isPendingToMe,
			"friendshipId":    friendship["_id"],
		}
	}

	var usersWithStatus []map[string]any
	for _, user := range users {
		settings := user.Settings
		if settings == (models.UserSettings{}) {
			settings = models.GetDefaultUserSettings()
		}

		isFriend := false
		if friendshipStatus, exists := statusMap[user.ID]; exists {
			status := friendshipStatus["status"].(string)
			isFriend = status == "accepted"
		}

		userMap := map[string]any{
			"id":            user.ID.Hex(),
			"name":          user.Name,
			"isCurrentUser": user.ID == currentUserID,
			"isFriend":      isFriend,
		}

		if settings.Privacy.ShowPicture || isFriend {
			userMap["picture"] = user.Picture
		}
		if settings.Privacy.ShowGivenName || isFriend {
			userMap["givenName"] = user.GivenName
		}
		if settings.Privacy.ShowFamilyName || isFriend {
			userMap["familyName"] = user.FamilyName
		}

		if friendshipStatus, exists := statusMap[user.ID]; exists {
			userMap["friendshipStatus"] = friendshipStatus
		} else {
			userMap["friendshipStatus"] = nil
		}

		usersWithStatus = append(usersWithStatus, userMap)
	}

	c.JSON(http.StatusOK, gin.H{
		"users":      usersWithStatus,
		"nextCursor": nextCursor,
		"hasMore":    hasMore,
	})
}
