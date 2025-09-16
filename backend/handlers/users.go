package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UpdateProfileRequest struct {
	Name        *string         `json:"name,omitempty"`
	GivenName   *string         `json:"givenName,omitempty"`
	FamilyName  *string         `json:"familyName,omitempty"`
	Bio         *string         `json:"bio,omitempty"`
	Picture     *string         `json:"picture,omitempty"`
	PhoneNumber *string         `json:"phoneNumber,omitempty"`
	Address     *models.Address `json:"address,omitempty"`
}

type CheckUsernameRequest struct {
	Name string `json:"name" binding:"required"`
}

func GetMe(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")
	var user models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	user.PasswordHash = ""
	fmt.Println(user, "user in /Projects/wm-courses/3-fall-2025/web-programming/final-web-programming/backend/handlers/users.go")
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")

	if req.Name != nil && *req.Name != "" {
		var existingUser models.User
		err := collection.FindOne(ctx, bson.M{
			"name": *req.Name,
			"_id":  bson.M{"$ne": userID},
		}).Decode(&existingUser)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
			return
		} else if err != mongo.ErrNoDocuments {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}
	}

	updateDoc := bson.M{}
	if req.Name != nil {
		updateDoc["name"] = *req.Name
	}
	if req.GivenName != nil {
		updateDoc["givenName"] = *req.GivenName
	}
	if req.FamilyName != nil {
		updateDoc["familyName"] = *req.FamilyName
	}
	if req.Bio != nil {
		updateDoc["bio"] = *req.Bio
	}
	if req.Picture != nil {
		updateDoc["picture"] = *req.Picture
	}
	if req.PhoneNumber != nil {
		updateDoc["phoneNumber"] = *req.PhoneNumber
	}
	if req.Address != nil {
		updateDoc["address"] = *req.Address
	}

	if len(updateDoc) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	update := bson.M{"$set": updateDoc}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var updatedUser models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated user"})
		return
	}

	updatedUser.PasswordHash = ""
	c.JSON(http.StatusOK, updatedUser)
}

func CheckUsername(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name parameter is required"})
		return
	}

	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")
	var existingUser models.User
	err = collection.FindOne(ctx, bson.M{
		"name": name,
		"_id":  bson.M{"$ne": userID},
	}).Decode(&existingUser)

	available := err == mongo.ErrNoDocuments
	if err != nil && err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"available": available})
}

