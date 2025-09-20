package handlers

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"github.com/zach-short/final-web-programming/utils"
	websocketPkg "github.com/zach-short/final-web-programming/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var wsHub *websocketPkg.Hub

func init() {
	wsHub = websocketPkg.NewHub()
	go wsHub.Run()
}

func HandleWebSocket(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	claims, err := utils.ValidateJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	c.Set("userID", claims.UserID.Hex())
	c.Set("email", claims.Email)

	conn, err := websocketPkg.UpgradeConnection(c.Writer, c.Request)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	client := websocketPkg.NewClient(wsHub, conn, claims.UserID)
	wsHub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}

func StartDMConversation(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		RecipientID string `json:"recipientId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipientID, err := primitive.ObjectIDFromHex(req.RecipientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipient ID"})
		return
	}

	roomID := models.CreateDMRoomID(userID, recipientID)

	room := models.Room{
		ID:           roomID,
		Type:         models.RoomTypeDM,
		Participants: []primitive.ObjectID{userID, recipientID},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	c.JSON(http.StatusOK, gin.H{
		"roomId": roomID,
		"room":   room,
	})
}

func GetDMHistory(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	recipientID := c.Param("recipientId")

	recipientOID, err := primitive.ObjectIDFromHex(recipientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipient ID"})
		return
	}

	roomID := models.CreateDMRoomID(userID, recipientOID)

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"roomId": roomID}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: 1}}).SetLimit(100)

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Error fetching messages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err = cursor.All(ctx, &messages); err != nil {
		log.Printf("Error decoding messages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"roomId":   roomID,
		"messages": messages,
	})
}

func GetUserConversations(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)
	_, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// todo: implement conversation list retrieval from mongodb
	c.JSON(http.StatusOK, gin.H{
		"conversations": []models.Room{},
	})
}
