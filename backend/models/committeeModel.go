package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

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
	CreatedAt   time.Time            `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time            `bson:"updatedAt" json:"updatedAt"`
}
