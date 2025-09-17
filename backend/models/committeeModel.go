package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Committee struct {
	Name        string               `bson:"name" json:"name"`
	ID          primitive.ObjectID   `bson:"_id" json:"id"`
	Type        string               `bson:"type" json:"type"`
	OwnerID     primitive.ObjectID   `bson:"owner_id" json:"owner_id"`
	ChairID     primitive.ObjectID   `bson:"chair_id" json:"chair_id"`
	MemberIDs   []primitive.ObjectID `bson:"member_ids" json:"member_ids"`
	ObserverIDs []primitive.ObjectID `bson:"observer_ids" json:"observer_id"`
}
