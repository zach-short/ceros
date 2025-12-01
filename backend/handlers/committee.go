package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func userHasCommitteeAccess(ctx context.Context, committeeID primitive.ObjectID, userID primitive.ObjectID) (*models.Committee, error) {
	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	var committee models.Committee
	err := collection.FindOne(ctx, bson.M{
		"_id": committeeID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
			{"memberIds": userID},
			{"observerIds": userID},
		},
	}).Decode(&committee)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("access denied or committee not found")
		}
		return nil, err
	}

	return &committee, nil
}

type NewCommitteeReq struct {
	Name        string   `json:"name" binding:"required"`
	Type        string   `json:"type" binding:"required"`
	Description string   `json:"description,omitempty"`
	OwnerID     string   `json:"ownerId" binding:"required"`
	ChairID     string   `json:"chairId" binding:"required"`
	MemberIDs   []string `json:"memberIds" binding:"required"`
	ObserverIDs []string `json:"observerIds,omitempty"`
}

func GetCommittees(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := bson.M{
		"$and": []bson.M{
			{
				"$or": []bson.M{
					{"ownerId": userID},
					{"chairId": userID},
				},
			},
		},
	}

	cursor, err := collection.Find(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding committees"})
		return
	}
	defer cursor.Close(ctx)

	var committees []models.Committee
	if err = cursor.All(ctx, &committees); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decoding committees"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"committees": committees})
}

func GetCommittee(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"committee": committee})
}

func GetUserCommittees(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := bson.M{
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
			{"memberIds": userID},
			{"observerIds": userID},
		},
	}

	cursor, err := collection.Find(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding committees"})
		return
	}
	defer cursor.Close(ctx)

	var committees []models.Committee
	if err = cursor.All(ctx, &committees); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decoding committees"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"committees": committees})
}

func CreateCommittee(c *gin.Context) {
	var req NewCommitteeReq

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIdFromContext := c.GetString("userID")
	userIdObjectID, err := primitive.ObjectIDFromHex(userIdFromContext)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID from auth context"})
		return
	}

	userId, err := primitive.ObjectIDFromHex(req.OwnerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid owner ID format"})
		return
	}

	ownerIDHex, err := primitive.ObjectIDFromHex(req.OwnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "with user id format"})
		return
	}

	chairIDHex, err := primitive.ObjectIDFromHex(req.ChairID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "with user id format"})
		return
	}

	var memberIDsHex []primitive.ObjectID
	for _, memberID := range req.MemberIDs {
		memberIDHex, err := primitive.ObjectIDFromHex(memberID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "with user id format"})
			return
		}

		memberIDsHex = append(memberIDsHex, memberIDHex)
	}

	var observerIDsHex []primitive.ObjectID
	for _, observerId := range req.ObserverIDs {
		observerIDHex, err := primitive.ObjectIDFromHex(observerId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "with user id format"})
			return
		}

		observerIDsHex = append(observerIDsHex, observerIDHex)
	}

	if userId != userIdObjectID {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": "user ids did not match"})
		return
	}

	now := time.Now()
	newCommittee := models.Committee{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		OwnerID:     ownerIDHex,
		ChairID:     chairIDHex,
		MemberIDs:   memberIDsHex,
		ObserverIDs: observerIDsHex,
		VotingRules: models.VotingRules{
			QuorumPercentage: 50,
			DefaultThreshold: models.VoteThresholdSimpleMajority,
			AllowAbstentions: true,
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, newCommittee)
	if err != nil {
		fmt.Printf("InsertOne Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating committee", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Created new committee", "id": newCommittee.ID.Hex()})
}

type UpdateCommitteeReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Picture     string `json:"picture"`
}

func UpdateCommittee(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner can update committee settings"})
		return
	}

	var req UpdateCommitteeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	update := bson.M{
		"$set": bson.M{
			"name":        req.Name,
			"description": req.Description,
			"picture":     req.Picture,
			"updatedAt":   time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update committee"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Committee updated successfully"})
}

func DeleteCommittee(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner can delete the committee"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	result, err := collection.DeleteOne(ctx, bson.M{"_id": committeeID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete committee"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Committee deleted successfully"})
}

type AddMemberReq struct {
	UserID string `json:"userId" binding:"required"`
}

func AddMember(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	var req AddMemberReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newMemberID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID && committee.ChairID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner or chair can add members"})
		return
	}

	if committee.OwnerID == newMemberID || committee.ChairID == newMemberID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user is already owner or chair"})
		return
	}

	for _, memberID := range committee.MemberIDs {
		if memberID == newMemberID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user is already a member"})
			return
		}
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	update := bson.M{
		"$addToSet": bson.M{"memberIds": newMemberID},
		"$set":      bson.M{"updatedAt": time.Now()},
		"$pull":     bson.M{"observerIds": newMemberID},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add member"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member added successfully"})
}

func RemoveMember(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	memberIdToRemove := c.Param("memberId")
	memberID, err := primitive.ObjectIDFromHex(memberIdToRemove)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID && committee.ChairID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner or chair can remove members"})
		return
	}

	if committee.OwnerID == memberID || committee.ChairID == memberID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot remove owner or chair as member"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	update := bson.M{
		"$pull": bson.M{"memberIds": memberID},
		"$set":  bson.M{"updatedAt": time.Now()},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove member"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}

type AddObserverReq struct {
	UserID string `json:"userId" binding:"required"`
}

func AddObserver(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	var req AddObserverReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newObserverID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID && committee.ChairID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner or chair can add observers"})
		return
	}

	if committee.OwnerID == newObserverID || committee.ChairID == newObserverID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user is already owner or chair"})
		return
	}

	for _, memberID := range committee.MemberIDs {
		if memberID == newObserverID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user is already a member"})
			return
		}
	}

	for _, observerID := range committee.ObserverIDs {
		if observerID == newObserverID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user is already an observer"})
			return
		}
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	update := bson.M{
		"$addToSet": bson.M{"observerIds": newObserverID},
		"$set":      bson.M{"updatedAt": time.Now()},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add observer"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Observer added successfully"})
}

func RemoveObserver(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	observerIdToRemove := c.Param("observerId")
	observerID, err := primitive.ObjectIDFromHex(observerIdToRemove)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid observer ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID && committee.ChairID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner or chair can remove observers"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	update := bson.M{
		"$pull": bson.M{"observerIds": observerID},
		"$set":  bson.M{"updatedAt": time.Now()},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove observer"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Observer removed successfully"})
}

type ChangeChairReq struct {
	NewChairID string `json:"newChairId" binding:"required"`
}

func ChangeChair(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	committeeId := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid committee ID"})
		return
	}

	var req ChangeChairReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newChairID, err := primitive.ObjectIDFromHex(req.NewChairID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid new chair ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	committee, err := userHasCommitteeAccess(ctx, committeeID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	if committee.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the owner can change the chair"})
		return
	}

	if committee.OwnerID == newChairID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "owner is already in a leadership role"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")

	oldChairID := committee.ChairID

	var update bson.M

	if oldChairID != newChairID {
		update = bson.M{
			"$set": bson.M{
				"chairId":   newChairID,
				"updatedAt": time.Now(),
			},
			"$pull": bson.M{
				"memberIds":   newChairID,
				"observerIds": newChairID,
			},
		}

		result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to change chair"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
			return
		}

		addOldChairUpdate := bson.M{
			"$addToSet": bson.M{"memberIds": oldChairID},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": committeeID}, addOldChairUpdate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update old chair membership"})
			return
		}
	} else {
		update = bson.M{
			"$set": bson.M{
				"chairId":   newChairID,
				"updatedAt": time.Now(),
			},
			"$pull": bson.M{"observerIds": newChairID},
		}

		result, err := collection.UpdateOne(ctx, bson.M{"_id": committeeID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to change chair"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "committee not found"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Chair changed successfully"})
}
