package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	ws "github.com/zach-short/final-web-programming/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetNotifications(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"user_id":   userID,
				"dismissed": false,
			},
		},
		{
			"$lookup": bson.M{
				"from":         "notifications",
				"localField":   "notification_id",
				"foreignField": "_id",
				"as":           "notification",
			},
		},
		{
			"$unwind": "$notification",
		},
		{
			"$match": bson.M{
				"$or": []bson.M{
					{"notification.expires_at": bson.M{"$exists": false}},
					{"notification.expires_at": bson.M{"$gt": time.Now()}},
				},
			},
		},
		{
			"$sort": bson.M{"created_at": -1},
		},
	}

	cursor, err := config.GetCollection("user_notifications").Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Error aggregating notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch notifications"})
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		log.Printf("Error decoding notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not decode notifications"})
		return
	}

	notifications := make([]models.NotificationWithStatus, 0, len(results))
	for _, result := range results {
		var notification models.NotificationWithStatus

		notifData := result["notification"].(bson.M)
		notification.ID = notifData["_id"].(primitive.ObjectID)
		notification.Type = notifData["type"].(string)
		notification.Title = notifData["title"].(string)
		notification.Message = notifData["message"].(string)
		notification.Urgency = notifData["urgency"].(string)
		notification.CreatedBy = notifData["created_by"].(primitive.ObjectID)
		notification.CreatedAt = notifData["created_at"].(primitive.DateTime).Time()

		if relatedID, exists := notifData["related_id"]; exists && relatedID != nil {
			relatedOID := relatedID.(primitive.ObjectID)
			notification.RelatedID = &relatedOID
		}

		if href, exists := notifData["href"]; exists && href != nil {
			hrefStr := href.(string)
			notification.Href = &hrefStr
		}

		if expiresAt, exists := notifData["expires_at"]; exists && expiresAt != nil {
			expiresTime := expiresAt.(primitive.DateTime).Time()
			notification.ExpiresAt = &expiresTime
		}

		notification.Read = result["read"].(bool)
		notification.Dismissed = result["dismissed"].(bool)

		if readAt, exists := result["read_at"]; exists && readAt != nil {
			readTime := readAt.(primitive.DateTime).Time()
			notification.ReadAt = &readTime
		}

		if dismissedAt, exists := result["dismissed_at"]; exists && dismissedAt != nil {
			dismissTime := dismissedAt.(primitive.DateTime).Time()
			notification.DismissedAt = &dismissTime
		}

		notifications = append(notifications, notification)
	}

	c.JSON(http.StatusOK, gin.H{"notifications": notifications})
}

func MarkNotificationRead(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	notificationIDStr := c.Param("notificationId")
	notificationID, err := primitive.ObjectIDFromHex(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid notification ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"read":    true,
			"read_at": now,
		},
	}

	result, err := config.GetCollection("user_notifications").UpdateOne(
		ctx,
		bson.M{"user_id": userID, "notification_id": notificationID},
		update,
	)

	if err != nil {
		log.Printf("Error marking notification as read: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update notification"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "notification marked as read"})
}

func MarkAllNotificationsRead(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"read":    true,
			"read_at": now,
		},
	}

	filter := bson.M{
		"user_id":   userID,
		"read":      false,
		"dismissed": false,
	}

	result, err := config.GetCollection("user_notifications").UpdateMany(ctx, filter, update)
	if err != nil {
		log.Printf("Error marking all notifications as read: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "all notifications marked as read",
		"count":   result.ModifiedCount,
	})
}

func DismissNotification(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	notificationIDStr := c.Param("notificationId")
	notificationID, err := primitive.ObjectIDFromHex(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid notification ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"dismissed":    true,
			"dismissed_at": now,
		},
	}

	result, err := config.GetCollection("user_notifications").UpdateOne(
		ctx,
		bson.M{"user_id": userID, "notification_id": notificationID},
		update,
	)

	if err != nil {
		log.Printf("Error dismissing notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not dismiss notification"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "notification dismissed"})
}

func CreateNotification(c *gin.Context) {
	var req models.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDStr := c.GetString("userID")
	createdBy, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	if req.Urgency == "" {
		req.Urgency = "medium"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		Type:       req.Type,
		RelatedID:  req.RelatedID,
		Title:      req.Title,
		Message:    req.Message,
		Urgency:    req.Urgency,
		Href:       req.Href,
		CreatedBy:  createdBy,
		Recipients: req.Recipients,
		CreatedAt:  time.Now(),
		ExpiresAt:  req.ExpiresAt,
	}

	_, err = config.GetCollection("notifications").InsertOne(ctx, notification)
	if err != nil {
		log.Printf("Error creating notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create notification"})
		return
	}

	userNotifications := make([]interface{}, len(req.Recipients))
	for i, recipientID := range req.Recipients {
		userNotifications[i] = models.UserNotification{
			ID:             primitive.NewObjectID(),
			UserID:         recipientID,
			NotificationID: notification.ID,
			Read:           false,
			Dismissed:      false,
			CreatedAt:      time.Now(),
		}
	}

	if len(userNotifications) > 0 {
		_, err = config.GetCollection("user_notifications").InsertMany(ctx, userNotifications)
		if err != nil {
			log.Printf("Error creating user notifications: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user notifications"})
			return
		}
	}

	if hub := c.MustGet("hub"); hub != nil {
		BroadcastNotificationToUsers(hub, notification)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "notification created successfully",
		"notification": notification,
	})
}

type NotificationService struct {
	Hub *ws.Hub
}

func BroadcastNotificationToUsers(hubInterface interface{}, notification models.Notification) {
	hub, ok := hubInterface.(*ws.Hub)
	if !ok {
		log.Printf("Invalid hub type")
		return
	}

	notifWithStatus := models.NotificationWithStatus{
		Notification: notification,
		Read:         false,
		Dismissed:    false,
	}

	message := models.WSMessage{
		Action:  "new_notification",
		Type:    models.TypeSystem,
		Payload: notifWithStatus,
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}

	hub.BroadcastToUsers(notification.Recipients, data)
}

func (ns *NotificationService) CreateMotionNotification(motion models.Motion, committeeMembers []primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		Type:       "motion",
		RelatedID:  &motion.ID,
		Title:      "New Motion: " + motion.Title,
		Message:    "A new motion has been created",
		Urgency:    "high",
		CreatedBy:  motion.MoverID,
		Recipients: committeeMembers,
		CreatedAt:  time.Now(),
	}

	href := "/motions/" + motion.ID.Hex()
	notification.Href = &href

	_, err := config.GetCollection("notifications").InsertOne(ctx, notification)
	if err != nil {
		return err
	}

	userNotifications := make([]interface{}, len(committeeMembers))
	for i, memberID := range committeeMembers {
		userNotifications[i] = models.UserNotification{
			ID:             primitive.NewObjectID(),
			UserID:         memberID,
			NotificationID: notification.ID,
			Read:           false,
			Dismissed:      false,
			CreatedAt:      time.Now(),
		}
	}

	if len(userNotifications) > 0 {
		_, err = config.GetCollection("user_notifications").InsertMany(ctx, userNotifications)
	}

	if ns.Hub != nil {
		BroadcastNotificationToUsers(ns.Hub, notification)
	}

	return err
}

func (ns *NotificationService) CreateVoteNotification(motionID primitive.ObjectID, title, message string, committeeMembers []primitive.ObjectID, createdBy primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		Type:       "vote",
		RelatedID:  &motionID,
		Title:      title,
		Message:    message,
		Urgency:    "high",
		CreatedBy:  createdBy,
		Recipients: committeeMembers,
		CreatedAt:  time.Now(),
	}

	href := "/voting/" + motionID.Hex()
	notification.Href = &href

	_, err := config.GetCollection("notifications").InsertOne(ctx, notification)
	if err != nil {
		return err
	}

	userNotifications := make([]interface{}, len(committeeMembers))
	for i, memberID := range committeeMembers {
		userNotifications[i] = models.UserNotification{
			ID:             primitive.NewObjectID(),
			UserID:         memberID,
			NotificationID: notification.ID,
			Read:           false,
			Dismissed:      false,
			CreatedAt:      time.Now(),
		}
	}

	if len(userNotifications) > 0 {
		_, err = config.GetCollection("user_notifications").InsertMany(ctx, userNotifications)
	}

	if ns.Hub != nil {
		BroadcastNotificationToUsers(ns.Hub, notification)
	}

	return err
}

func (ns *NotificationService) CreateFriendRequestNotification(friendship models.Friendship, requesterName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var recipient models.User
	err := config.GetCollection("users").FindOne(ctx, bson.M{"_id": friendship.AddresseeID}).Decode(&recipient)
	if err != nil {
		log.Printf("Error fetching recipient user: %v", err)
		return err
	}

	settings := recipient.Settings
	if settings == (models.UserSettings{}) {
		settings = models.GetDefaultUserSettings()
	}

	if !settings.Notifications.FriendRequestNotifications {
		return nil
	}

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		Type:       "friend_request",
		RelatedID:  &friendship.ID,
		Title:      "New Friend Request",
		Message:    requesterName + " sent you a friend request",
		Urgency:    "medium",
		CreatedBy:  friendship.RequesterID,
		Recipients: []primitive.ObjectID{friendship.AddresseeID},
		CreatedAt:  time.Now(),
	}

	href := "/friends"
	notification.Href = &href

	_, err = config.GetCollection("notifications").InsertOne(ctx, notification)
	if err != nil {
		return err
	}

	userNotification := models.UserNotification{
		ID:             primitive.NewObjectID(),
		UserID:         friendship.AddresseeID,
		NotificationID: notification.ID,
		Read:           false,
		Dismissed:      false,
		CreatedAt:      time.Now(),
	}

	_, err = config.GetCollection("user_notifications").InsertOne(ctx, userNotification)

	if ns.Hub != nil {
		BroadcastNotificationToUsers(ns.Hub, notification)
	}

	return err
}

func (ns *NotificationService) CreateFriendRequestAcceptedNotification(friendship models.Friendship, accepterName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var requester models.User
	err := config.GetCollection("users").FindOne(ctx, bson.M{"_id": friendship.RequesterID}).Decode(&requester)
	if err != nil {
		log.Printf("Error fetching requester user: %v", err)
		return err
	}

	settings := requester.Settings
	if settings == (models.UserSettings{}) {
		settings = models.GetDefaultUserSettings()
	}

	if !settings.Notifications.FriendRequestNotifications {
		return nil
	}

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		Type:       "friend_request_accepted",
		RelatedID:  &friendship.ID,
		Title:      "Friend Request Accepted",
		Message:    accepterName + " accepted your friend request",
		Urgency:    "low",
		CreatedBy:  friendship.AddresseeID,
		Recipients: []primitive.ObjectID{friendship.RequesterID},
		CreatedAt:  time.Now(),
	}

	href := "/friends"
	notification.Href = &href

	_, err = config.GetCollection("notifications").InsertOne(ctx, notification)
	if err != nil {
		return err
	}

	userNotification := models.UserNotification{
		ID:             primitive.NewObjectID(),
		UserID:         friendship.RequesterID,
		NotificationID: notification.ID,
		Read:           false,
		Dismissed:      false,
		CreatedAt:      time.Now(),
	}

	_, err = config.GetCollection("user_notifications").InsertOne(ctx, userNotification)

	if ns.Hub != nil {
		BroadcastNotificationToUsers(ns.Hub, notification)
	}

	return err
}
