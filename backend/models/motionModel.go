package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Meeting struct {
	ID          primitive.ObjectID   `bson:"_id" json:"_id"`
	CommitteeID primitive.ObjectID   `bson:"committee_id" json:"committee_id"`
	Motions     []primitive.ObjectID `bson:"motions" json:"motions"`
	StartTime   time.Time            `bson:"start_time" json:"start_time"`
	EndTime     time.Time            `bson:"end_time" json:"end_time"`
}

type MotionStatus string

const (
	MotionStatusProposed MotionStatus = "proposed"
	MotionStatusSeconded MotionStatus = "seconded"
	MotionStatusOpen     MotionStatus = "open"
	MotionStatusPassed   MotionStatus = "passed"
	MotionStatusFailed   MotionStatus = "failed"
	MotionStatusTabled   MotionStatus = "tabled"
)

type Motion struct {
	ID           primitive.ObjectID   `bson:"_id" json:"id"`
	CommitteeID  primitive.ObjectID   `bson:"committee_id" json:"committee_id"`
	MoverID      primitive.ObjectID   `bson:"mover_id" json:"mover_id"`
	SeconderID   *primitive.ObjectID  `bson:"seconder_id,omitempty" json:"seconder_id,omitempty"`
	Title        string               `bson:"title" json:"title"`
	Description  string               `bson:"description" json:"description"`
	Status       MotionStatus         `bson:"status" json:"status"`
	Votes        []Vote               `bson:"votes" json:"votes"`
	Comments     []Comment            `bson:"comments" json:"comments"`
	IsSpecial    bool                 `bson:"is_special" json:"is_special"`
	Summary      string               `bson:"summary,omitempty" json:"summary"`
	CreatedAt    time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time            `bson:"updated_at" json:"updated_at"`
	VotingEndsAt *time.Time           `bson:"voting_ends_at,omitempty" json:"voting_ends_at,omitempty"`
}
