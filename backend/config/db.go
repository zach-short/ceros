package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

func GetCollection(collectionName string) *mongo.Collection {
	databaseName := os.Getenv("DATABASE_NAME")
	if databaseName == "" {
		databaseName = "db"
	}
	return DB.Database(databaseName).Collection(collectionName)
}

func loadEnvFile() error {
	_, filename, _, _ := runtime.Caller(0)
	currentDir := filepath.Dir(filename)

	envPaths := []string{
		filepath.Join(currentDir, "..", ".env"),
		".env",
	}

	var lastErr error
	for _, path := range envPaths {
		absPath, _ := filepath.Abs(path)
		if _, err := os.Stat(absPath); err == nil {
			log.Printf("Found .env file at: %s", absPath)
			if err := godotenv.Load(absPath); err == nil {
				log.Printf("Successfully loaded environment from: %s", absPath)
				return nil
			} else {
				lastErr = fmt.Errorf("found .env at %s but failed to load: %v", absPath, err)
			}
		} else {
			log.Printf("No .env file at: %s", absPath)
		}
	}

	if lastErr != nil {
		return lastErr
	}
	return fmt.Errorf("no .env file found in search paths")
}

func ValidateEnv() error {
	err := loadEnvFile()
	if err != nil {
		log.Printf("Warning: %v", err)
		log.Println("Proceeding with system environment variables")
	}

	return nil
}

func ConnectDB() {
	if err := ValidateEnv(); err != nil {
		log.Fatal(err)
	}

	mongoURI := os.Getenv("DATABASE_URL")

	if mongoURI == "" {
		log.Fatal("DATABASE_URL is empty")
	}

	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetServerAPIOptions(options.ServerAPI(options.ServerAPIVersion1)).
		SetTimeout(10 * time.Second)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Printf("Connection error details: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB: ", err)
	}

	DB = client
}
