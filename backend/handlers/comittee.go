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
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NewCommiteeReq struct {
	Name        string `json:"name" binding:"required"`
	Type        string `bson:"type" json:"type"`
	Description string `bson:"description,omitempty" json:"description,omitempty"`
	OwnerID     string
	ChairID     string
	MemberIDs   []string
	ObserverIDs []string
}

func GetComittee() {

}

func CreateComittee(c *gin.Context) {
	var req NewCommiteeReq
	userIdParam := c.Param("userId")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIdObjectID, err := primitive.ObjectIDFromHex(userIdParam)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "with user id"})
		return
	}

	userId, err := primitive.ObjectIDFromHex(req.OwnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "with user id format"})
		return
	}

	ownerIDHex, err := primitive.ObjectIDFromHex(req.OwnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "with user id format"})
		return
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
		ChairID:     req.ChairID,
		MemberIDs:   req.MemberIDs,
		ObserverIDs: req.ObserverIDs,
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("Committee")

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

func UpdateComittee() {

}

func DeleteComittee() {

}
