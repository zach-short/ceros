package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FriendStatus string

const (
	FriendStatusPending  FriendStatus = "pending"
	FriendStatusAccepted FriendStatus = "accepted"
	FriendStatusBlocked  FriendStatus = "blocked"
)

type Friendship struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	RequesterID primitive.ObjectID `bson:"requesterId" json:"requesterId"`
	AddresseeID primitive.ObjectID `bson:"addresseeId" json:"addresseeId"`
	Status      FriendStatus       `bson:"status" json:"status"`
	RequestedAt time.Time          `bson:"requestedAt" json:"requestedAt"`
	RespondedAt *time.Time         `bson:"respondedAt,omitempty" json:"respondedAt,omitempty"`
}

