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
	"github.com/zach-short/final-web-programming/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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

	committees, err := utils.FetchItems(query, "committees")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "finding committees"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"committees": committees})
}

func GetCommittee(c *gin.Context) {

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

	newCommittee := models.Committee{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		OwnerID:     ownerIDHex,
		ChairID:     chairIDHex,
		MemberIDs:   memberIDsHex,
		ObserverIDs: observerIDsHex,
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

	c.JSON(http.StatusOK, gin.H{"message": "Created new committee"})
}
