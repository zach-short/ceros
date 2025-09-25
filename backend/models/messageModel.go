package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MessageType string

const (
	TypeDM     MessageType = "dm"
	TypeGroup  MessageType = "group"
	TypeMotion MessageType = "motion"
	TypeSystem MessageType = "system"
	TypeReply  MessageType = "reply"
)

type Message struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Type      MessageType        `json:"type" bson:"type"`
	SenderID  primitive.ObjectID `json:"senderId" bson:"senderId"`
	Content   string             `json:"content" bson:"content"`
	RoomID    string             `json:"roomId" bson:"roomId"`
	Timestamp time.Time          `json:"timestamp" bson:"timestamp"`

	ParentMessageID *primitive.ObjectID `json:"parentMessageId,omitempty" bson:"parentMessageId,omitempty"`
	ThreadCount     int                 `json:"threadCount,omitempty" bson:"threadCount,omitempty"`
	MotionID        *primitive.ObjectID `json:"motionId,omitempty" bson:"motionId,omitempty"`
	VoteID          *primitive.ObjectID `json:"voteId,omitempty" bson:"voteId,omitempty"`

	Metadata map[string]any `json:"metadata,omitempty" bson:"metadata,omitempty"`
}


type WSMessage struct {
	Action  string      `json:"action"`
	Type    MessageType `json:"type"`
	Payload any         `json:"payload"`
}

type RoomType string

const (
	RoomTypeDM        RoomType = "dm"
	RoomTypeGroup     RoomType = "group"
	RoomTypeCommittee RoomType = "committee"
)

type Room struct {
	ID           string               `json:"id" bson:"_id"`
	OwnerID      primitive.ObjectID   `json:"ownerId" bson:"ownerId"`
	Type         RoomType             `json:"type" bson:"type"`
	Participants []primitive.ObjectID `json:"participants" bson:"participants"`
	CreatedAt    time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time            `json:"updatedAt" bson:"updatedAt"`

	Name        string              `json:"name,omitempty" bson:"name,omitempty"`
	Description string              `json:"description,omitempty" bson:"description,omitempty"`
	CommitteeID *primitive.ObjectID `json:"committeeId,omitempty" bson:"committeeId,omitempty"`
}

func CreateDMRoomID(userID1, userID2 primitive.ObjectID) string {
	if userID1.Hex() < userID2.Hex() {
		return "dm_" + userID1.Hex() + "_" + userID2.Hex()
	}
	return "dm_" + userID2.Hex() + "_" + userID1.Hex()
}

func CreateGroupRoomID(groupID primitive.ObjectID) string {
	return "group_" + groupID.Hex()
}

func CreateCommitteeRoomID(committeeID primitive.ObjectID) string {
	return "committee_" + committeeID.Hex()
}
