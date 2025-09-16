package utils

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/zach-short/final-web-programming/config"
	"go.mongodb.org/mongo-driver/bson"
)

var adjectives = []string{
	"happy", "clever", "bright", "swift", "brave", "kind", "smart", "cool",
	"quick", "bold", "calm", "wise", "fun", "neat", "nice", "good",
	"fresh", "warm", "lucky", "funny", "sleek", "sharp", "epic", "wild",
	"free", "pure", "rare", "true", "fine", "rich", "blue", "red",
	"gold", "pink", "mint", "sage", "jade", "ruby", "cyan", "lime",
}

var nouns = []string{
	"cat", "dog", "bird", "fish", "bear", "wolf", "fox", "deer",
	"lion", "duck", "frog", "bee", "owl", "hawk", "dove", "ant",
	"star", "moon", "sun", "tree", "leaf", "rock", "wave", "wind",
	"fire", "snow", "rain", "cloud", "sky", "lake", "hill", "path",
	"code", "byte", "data", "chip", "disk", "link", "node", "mesh",
	"user", "hero", "sage", "mage", "ninja", "poet", "bard", "knight",
}

func GenerateRandomUsername() (string, error) {
	rand.Seed(time.Now().UnixNano())

	maxAttempts := 10
	for attempt := 0; attempt < maxAttempts; attempt++ {
		adjective := adjectives[rand.Intn(len(adjectives))]
		noun := nouns[rand.Intn(len(nouns))]
		number := rand.Intn(999) + 1

		username := fmt.Sprintf("%s_%s_%d", adjective, noun, number)

		if !usernameExists(username) {
			return username, nil
		}
	}

	timestamp := time.Now().Unix()
	adjective := adjectives[rand.Intn(len(adjectives))]
	noun := nouns[rand.Intn(len(nouns))]
	username := fmt.Sprintf("%s_%s_%d", adjective, noun, timestamp)

	return username, nil
}

func usernameExists(username string) bool {
	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, err := collection.CountDocuments(ctx, bson.M{"name": username})
	if err != nil {
		return true
	}

	return count > 0
}

func GenerateUsernameFromEmail(email string) (string, error) {
	parts := strings.Split(email, "@")
	if len(parts) == 0 {
		return GenerateRandomUsername()
	}

	baseUsername := parts[0]
	cleanBase := strings.ToLower(strings.ReplaceAll(baseUsername, ".", "_"))

	if !usernameExists(cleanBase) {
		return cleanBase, nil
	}

	for i := 1; i <= 999; i++ {
		username := fmt.Sprintf("%s_%d", cleanBase, i)
		if !usernameExists(username) {
			return username, nil
		}
	}

	return GenerateRandomUsername()
}

