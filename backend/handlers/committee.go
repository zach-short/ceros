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
		CreatedAt:   now,
		UpdatedAt:   now,
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
