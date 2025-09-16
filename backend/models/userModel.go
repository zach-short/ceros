package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Address struct {
	Street string `bson:"street,omitempty" json:"street,omitempty"`
	City   string `bson:"city,omitempty" json:"city,omitempty"`
	State  string `bson:"state,omitempty" json:"state,omitempty"`
	Zip    string `bson:"zip,omitempty" json:"zip,omitempty"`
}

type User struct {
	ID           primitive.ObjectID `bson:"_id" json:"id"`
	Email        string             `bson:"email" json:"email"`
	Name         string             `bson:"name,omitempty" json:"name,omitempty"`
	GivenName    string             `bson:"givenName,omitempty" json:"givenName,omitempty"`
	FamilyName   string             `bson:"familyName,omitempty" json:"familyName,omitempty"`
	PasswordHash string             `bson:"passwordHash,omitempty" json:"passwordHash,omitempty"`
	Bio          string             `bson:"bio,omitempty" json:"bio,omitempty"`
	Picture      string             `bson:"picture,omitempty" json:"picture,omitempty"`
	PhoneNumber  string             `bson:"phoneNumber,omitempty" json:"phoneNumber,omitempty"`
	Address      Address            `bson:"address,omitempty" json:"address,omitempty"`
}
