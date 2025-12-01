package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/utils"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Define command-line flags
	count := flag.Int("count", 10, "Number of users to seed")
	clear := flag.Bool("clear", false, "Clear all test users before seeding")
	clearOnly := flag.Bool("clear-only", false, "Only clear test users without seeding new ones")
	flag.Parse()

	// Connect to database
	config.ConnectDB()

	// Clear only mode
	if *clearOnly {
		fmt.Println("🗑️  Clearing test users...")
		if err := utils.ClearTestUsers(); err != nil {
			log.Fatalf("Error clearing test users: %v", err)
		}
		fmt.Println("✅ Done!")
		os.Exit(0)
	}

	// Clear before seeding if requested
	if *clear {
		fmt.Println("🗑️  Clearing existing test users...")
		if err := utils.ClearTestUsers(); err != nil {
			log.Fatalf("Error clearing test users: %v", err)
		}
		fmt.Println()
	}

	// Seed users
	if err := utils.SeedUsers(*count); err != nil {
		log.Fatalf("Error seeding users: %v", err)
	}
}
