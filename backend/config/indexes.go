package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// EnsureIndexes creates all required database indexes for optimal query performance
func EnsureIndexes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db := DB.Database(os.Getenv("DATABASE_NAME"))
	usersCollection := db.Collection("users")

	// Text index for multi-field user search
	// Enables efficient searching across name, givenName, and familyName
	textIndexModel := mongo.IndexModel{
		Keys: bson.D{
			{Key: "name", Value: "text"},
			{Key: "givenName", Value: "text"},
			{Key: "familyName", Value: "text"},
		},
		Options: options.Index().
			SetName("user_search_text_idx").
			SetWeights(bson.M{
				"name":       10, // Higher weight for username matches
				"givenName":  5,
				"familyName": 5,
			}),
	}

	_, err := usersCollection.Indexes().CreateOne(ctx, textIndexModel)
	if err != nil {
		log.Printf("Error creating text index: %v", err)
		return err
	}

	log.Println("Database indexes created successfully")
	return nil
}
