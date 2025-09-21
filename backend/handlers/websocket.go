package handlers

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
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

type ConversationSummary struct {
	RoomID        string               `json:"roomId"`
	Type          models.RoomType      `json:"type"`
	Participants  []primitive.ObjectID `json:"participants"`
	LastMessage   *models.Message      `json:"lastMessage,omitempty"`
	LastMessageAt time.Time            `json:"lastMessageAt"`
	UnreadCount   int                  `json:"unreadCount"`
}

func GetUserConversations(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"$or": []bson.M{
					{"senderId": userID},
					{"roomId": bson.M{"$regex": userID.Hex()}},
				},
			},
		},
		{
			"$sort": bson.M{"timestamp": -1},
		},
		{
			"$group": bson.M{
				"_id":           "$roomId",
				"lastMessage":   bson.M{"$first": "$$ROOT"},
				"lastMessageAt": bson.M{"$first": "$timestamp"},
				"messageCount":  bson.M{"$sum": 1},
			},
		},
		{
			"$sort": bson.M{"lastMessageAt": -1},
		},
		{
			"$limit": 50,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Error aggregating conversations: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations"})
		return
	}
	defer cursor.Close(ctx)

	var conversations []ConversationSummary
	for cursor.Next(ctx) {
		var result struct {
			ID            string         `bson:"_id"`
			LastMessage   models.Message `bson:"lastMessage"`
			LastMessageAt time.Time      `bson:"lastMessageAt"`
			MessageCount  int            `bson:"messageCount"`
		}

		if err := cursor.Decode(&result); err != nil {
			log.Printf("Error decoding conversation: %v", err)
			continue
		}

		var participants []primitive.ObjectID
		var roomType models.RoomType

		if strings.HasPrefix(result.ID, "dm_") {
			roomType = models.RoomTypeDM
			parts := strings.Split(result.ID, "_")
			if len(parts) == 3 {
				if id1, err := primitive.ObjectIDFromHex(parts[1]); err == nil {
					participants = append(participants, id1)
				}
				if id2, err := primitive.ObjectIDFromHex(parts[2]); err == nil {
					participants = append(participants, id2)
				}
			}
		} else if strings.HasPrefix(result.ID, "group_") {
			roomType = models.RoomTypeGroup
			participants = append(participants, userID)
		} else if strings.HasPrefix(result.ID, "committee_") {
			roomType = models.RoomTypeCommittee
			participants = append(participants, userID)
		}

		conversation := ConversationSummary{
			RoomID:        result.ID,
			Type:          roomType,
			Participants:  participants,
			LastMessage:   &result.LastMessage,
			LastMessageAt: result.LastMessageAt,
			UnreadCount:   0,
		}

		conversations = append(conversations, conversation)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading conversations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"conversations": conversations,
	})
}

func StartCommitteeChat(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	committeeIDStr := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	roomID := models.CreateCommitteeRoomID(committeeID)

	room := models.Room{
		ID:          roomID,
		Type:        models.RoomTypeCommittee,
		OwnerID:     userID,
		CommitteeID: &committeeID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	c.JSON(http.StatusOK, gin.H{
		"roomId": roomID,
		"room":   room,
	})
}

func GetCommitteeHistory(c *gin.Context) {
	/* userIDStr := c.MustGet("userID").(string) */
	/* userID, err := primitive.ObjectIDFromHex(userIDStr) */
	/* if err != nil { */
	/* 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"}) */
	/* 	return */
	/* } */

	committeeID := c.Param("id")
	committeeOID, err := primitive.ObjectIDFromHex(committeeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	roomID := models.CreateCommitteeRoomID(committeeOID)

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"roomId": roomID}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: 1}}).SetLimit(200)

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Error fetching committee messages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err = cursor.All(ctx, &messages); err != nil {
		log.Printf("Error decoding committee messages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"roomId":   roomID,
		"messages": messages,
	})
}

func GetMessageReplies(c *gin.Context) {
	messageID := c.Param("id")
	messageOID, err := primitive.ObjectIDFromHex(messageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"parentMessageId": messageOID}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: 1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Error fetching replies: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch replies"})
		return
	}
	defer cursor.Close(ctx)

	var replies []models.Message
	if err = cursor.All(ctx, &replies); err != nil {
		log.Printf("Error decoding replies: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode replies"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"replies": replies,
	})
}
