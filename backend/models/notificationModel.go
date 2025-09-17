package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Notification struct {
	ID         primitive.ObjectID   `bson:"_id" json:"id"`
	Type       string               `bson:"type" json:"type"`                                 // "motion", "vote", "announcement", "system"
	RelatedID  *primitive.ObjectID  `bson:"related_id,omitempty" json:"related_id,omitempty"` // reference to motion/vote/etc
	Title      string               `bson:"title" json:"title"`
	Message    string               `bson:"message" json:"message"`
	Urgency    string               `bson:"urgency" json:"urgency"`               // "low", "medium", "high"
	Href       *string              `bson:"href,omitempty" json:"href,omitempty"` // optional link
	CreatedBy  primitive.ObjectID   `bson:"created_by" json:"created_by"`
	Recipients []primitive.ObjectID `bson:"recipients" json:"recipients"` // user IDs who should receive this
	CreatedAt  time.Time            `bson:"created_at" json:"created_at"`
	ExpiresAt  *time.Time           `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
}

type UserNotification struct {
	ID             primitive.ObjectID `bson:"_id" json:"id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	NotificationID primitive.ObjectID `bson:"notification_id" json:"notification_id"`
	Read           bool               `bson:"read" json:"read"`
	ReadAt         *time.Time         `bson:"read_at,omitempty" json:"read_at,omitempty"`
	Dismissed      bool               `bson:"dismissed" json:"dismissed"`
	DismissedAt    *time.Time         `bson:"dismissed_at,omitempty" json:"dismissed_at,omitempty"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
}

type NotificationWithStatus struct {
	Notification
	Read        bool       `json:"read"`
	ReadAt      *time.Time `json:"read_at,omitempty"`
	Dismissed   bool       `json:"dismissed"`
	DismissedAt *time.Time `json:"dismissed_at,omitempty"`
}

type CreateNotificationRequest struct {
	Type       string               `json:"type" binding:"required"`
	RelatedID  *primitive.ObjectID  `json:"related_id,omitempty"`
	Title      string               `json:"title" binding:"required"`
	Message    string               `json:"message" binding:"required"`
	Urgency    string               `json:"urgency"`
	Href       *string              `json:"href,omitempty"`
	Recipients []primitive.ObjectID `json:"recipients" binding:"required"`
	ExpiresAt  *time.Time           `json:"expires_at,omitempty"`
}

