package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type VotingRules struct {
	QuorumPercentage int           `bson:"quorum_percentage" json:"quorum_percentage"`
	DefaultThreshold VoteThreshold `bson:"default_threshold" json:"default_threshold"`
	AllowAbstentions bool          `bson:"allow_abstentions" json:"allow_abstentions"`
}

type Committee struct {
	ID          primitive.ObjectID   `bson:"_id" json:"id"`
	Name        string               `bson:"name" json:"name"`
	Type        string               `bson:"type" json:"type"`
	Description string               `bson:"description,omitempty" json:"description,omitempty"`
	Picture     string               `bson:"picture,omitempty" json:"picture,omitempty"`
	OwnerID     primitive.ObjectID   `bson:"ownerId" json:"ownerId"`
	ChairID     primitive.ObjectID   `bson:"chairId" json:"chairId"`
	MemberIDs   []primitive.ObjectID `bson:"memberIds" json:"memberIds"`
	ObserverIDs []primitive.ObjectID `bson:"observerIds,omitempty" json:"observerIds,omitempty"`
	VotingRules VotingRules          `bson:"voting_rules" json:"voting_rules"`
	CreatedAt   time.Time            `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time            `bson:"updatedAt" json:"updatedAt"`
}
