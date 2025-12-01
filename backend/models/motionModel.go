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

type VoteThreshold string

const (
	VoteThresholdSimpleMajority VoteThreshold = "simple_majority"
	VoteThresholdTwoThirds      VoteThreshold = "two_thirds"
	VoteThresholdUnanimous      VoteThreshold = "unanimous"
)

type VoteTally struct {
	AyeCount      int        `bson:"aye_count" json:"aye_count"`
	NayCount      int        `bson:"nay_count" json:"nay_count"`
	AbstainCount  int        `bson:"abstain_count" json:"abstain_count"`
	TotalEligible int        `bson:"total_eligible" json:"total_eligible"`
	QuorumMet     bool       `bson:"quorum_met" json:"quorum_met"`
	Passed        *bool      `bson:"passed,omitempty" json:"passed,omitempty"`
	TalliedAt     *time.Time `bson:"tallied_at,omitempty" json:"tallied_at,omitempty"`
}

type Motion struct {
	ID             primitive.ObjectID   `bson:"_id" json:"id"`
	CommitteeID    primitive.ObjectID   `bson:"committee_id" json:"committee_id"`
	MoverID        primitive.ObjectID   `bson:"mover_id" json:"mover_id"`
	SeconderID     *primitive.ObjectID  `bson:"seconder_id,omitempty" json:"seconder_id,omitempty"`
	Title          string               `bson:"title" json:"title"`
	Description    string               `bson:"description" json:"description"`
	Status         MotionStatus         `bson:"status" json:"status"`
	VoteThreshold  VoteThreshold        `bson:"vote_threshold" json:"vote_threshold"`
	RequiresQuorum bool                 `bson:"requires_quorum" json:"requires_quorum"`
	Votes          []Vote               `bson:"votes" json:"votes"`
	VoteTally      *VoteTally           `bson:"vote_tally,omitempty" json:"vote_tally,omitempty"`
	Comments       []Comment            `bson:"comments" json:"comments"`
	IsSpecial      bool                 `bson:"is_special" json:"is_special"`
	Summary        string               `bson:"summary,omitempty" json:"summary"`
	CreatedAt      time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time            `bson:"updated_at" json:"updated_at"`
	VotingEndsAt   *time.Time           `bson:"voting_ends_at,omitempty" json:"voting_ends_at,omitempty"`
}
