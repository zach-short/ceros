package utils

import (
	"context"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

var maleFirstNames = []string{
	"James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
	"Thomas", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven",
	"Andrew", "Paul", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy",
	"Ryan", "Jason", "Justin", "Brandon", "Nathan", "Benjamin", "Samuel", "Alexander",
	"Nicholas", "Tyler", "Aaron", "Eric", "Jacob", "Adam", "Jack", "Luke",
	"Henry", "Owen", "Dylan", "Zachary", "Ethan", "Noah", "Logan", "Caleb",
}

var femaleFirstNames = []string{
	"Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Jessica", "Sarah",
	"Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly",
	"Emily", "Donna", "Michelle", "Carol", "Amanda", "Dorothy", "Melissa", "Deborah",
	"Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen", "Amy", "Angela",
	"Shirley", "Anna", "Brenda", "Pamela", "Emma", "Nicole", "Helen", "Samantha",
	"Rachel", "Katherine", "Grace", "Victoria", "Olivia", "Sophia", "Isabella", "Mia",
	"Charlotte", "Abigail", "Harper", "Evelyn", "Madison", "Ella", "Scarlett", "Zoe",
}

var lastNames = []string{
	"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
	"Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
	"Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
	"Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
	"Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
	"Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
	"Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
	"Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
	"Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
	"Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
	"Watson", "Brooks", "Chavez", "Wood", "James", "Bendex", "Chen", "Bell",
}

var usernameVariants = []string{
	"", "1", "2", "3", "42", "99", "123", "777", "420", "69",
}

var usernameSuffixes = []string{
	"", "love", "cool", "star", "pro", "king", "queen", "real", "official", "the",
	"boss", "legend", "master", "super", "ultra", "mega", "elite", "prime", "ace",
}

// GenerateUsername creates a unique username based on first and last name
func GenerateUsername(firstName, lastName string, existingUsernames map[string]bool) string {
	// Convert to lowercase and clean
	first := strings.ToLower(firstName)
	last := strings.ToLower(lastName)

	// Random seed
	rand.Seed(time.Now().UnixNano())

	// Try different patterns
	patterns := []string{
		// Pattern 1: first initial + last name + number
		fmt.Sprintf("%s%s%s", string(first[0]), last, usernameVariants[rand.Intn(len(usernameVariants))]),
		// Pattern 2: first name + last initial + number
		fmt.Sprintf("%s%s%s", first, string(last[0]), usernameVariants[rand.Intn(len(usernameVariants))]),
		// Pattern 3: first + suffix + number
		fmt.Sprintf("%s%s%s", first, usernameSuffixes[rand.Intn(len(usernameSuffixes))], usernameVariants[rand.Intn(len(usernameVariants))]),
		// Pattern 4: last + suffix + number
		fmt.Sprintf("%s%s%s", last, usernameSuffixes[rand.Intn(len(usernameSuffixes))], usernameVariants[rand.Intn(len(usernameVariants))]),
		// Pattern 5: first initial + last + suffix + number
		fmt.Sprintf("%s%s%s%s", string(first[0]), last, usernameSuffixes[rand.Intn(len(usernameSuffixes))], usernameVariants[rand.Intn(len(usernameVariants))]),
		// Pattern 6: full name concatenated + number
		fmt.Sprintf("%s%s%s", first, last, usernameVariants[rand.Intn(len(usernameVariants))]),
	}

	// Try patterns until we find a unique one
	for _, pattern := range patterns {
		if pattern != "" && !existingUsernames[pattern] {
			existingUsernames[pattern] = true
			return pattern
		}
	}

	// Fallback: add random number to make it unique
	for {
		username := fmt.Sprintf("%s%s%d", string(first[0]), last, rand.Intn(10000))
		if !existingUsernames[username] {
			existingUsernames[username] = true
			return username
		}
	}
}

// GenerateDicebearAvatar creates a dicebear avatar URL with gender
func GenerateDicebearAvatar(seed string, gender string) string {
	// Using the "avataaars" style with gender parameter
	// Gender can be "male" or "female"
	// You can change to other styles like: "bottts", "identicon", "pixel-art", etc.
	return fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s&gender=%s", seed, gender)
}

// SeedUsers creates a specified number of test users
func SeedUsers(count int) error {
	collection := config.GetCollection("users")
	ctx := context.Background()

	// Track existing usernames to ensure uniqueness
	existingUsernames := make(map[string]bool)

	// Random seed
	rand.Seed(time.Now().UnixNano())

	fmt.Printf("🌱 Seeding %d users...\n", count)

	for i := 1; i <= count; i++ {
		// Randomly choose gender (50/50)
		var firstName string
		var gender string
		if rand.Intn(2) == 0 {
			gender = "male"
			firstName = maleFirstNames[rand.Intn(len(maleFirstNames))]
		} else {
			gender = "female"
			firstName = femaleFirstNames[rand.Intn(len(femaleFirstNames))]
		}

		lastName := lastNames[rand.Intn(len(lastNames))]

		// Generate unique username
		username := GenerateUsername(firstName, lastName, existingUsernames)

		// Generate email (test@test.com, test2@test.com, etc.)
		email := fmt.Sprintf("test%s@test.com", func() string {
			if i == 1 {
				return ""
			}
			return fmt.Sprintf("%d", i)
		}())

		// Generate password (password, password2, password3, etc.)
		plainPassword := fmt.Sprintf("password%s", func() string {
			if i == 1 {
				return ""
			}
			return fmt.Sprintf("%d", i)
		}())

		// Hash password with bcrypt
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password for user %d: %v", i, err)
		}

		// Check if user already exists
		var existingUser models.User
		err = collection.FindOne(ctx, bson.M{"email": email, "isDeleted": bson.M{"$ne": true}}).Decode(&existingUser)
		if err == nil {
			fmt.Printf("⏭️  User %d already exists: %s (%s)\n", i, email, username)
			continue
		}

		// Generate dicebear avatar URL with gender
		avatarURL := GenerateDicebearAvatar(username, gender)

		// Create user
		user := models.User{
			ID:           primitive.NewObjectID(),
			Email:        email,
			Name:         username,
			GivenName:    firstName,
			FamilyName:   lastName,
			PasswordHash: string(hashedPassword),
			Picture:      avatarURL,
			Settings:     func() models.UserSettings {
			s := models.GetDefaultUserSettings()
			s.AutoAcceptFriendInvitations = true
			return s
		}(),
			IsOnline:     false,
			LastSeen:     primitive.NewDateTimeFromTime(time.Now()),
			IsDeleted:    false,
		}

		// Insert into database
		_, err = collection.InsertOne(ctx, user)
		if err != nil {
			return fmt.Errorf("failed to insert user %d: %v", i, err)
		}

		// Gender emoji for visual clarity
		genderEmoji := "👨"
		if gender == "female" {
			genderEmoji = "👩"
		}

		fmt.Printf("✅ Created user %d: %s %s %s (%s) - %s / %s\n",
			i, genderEmoji, firstName, lastName, username, email, plainPassword)
	}

	fmt.Printf("🎉 Successfully seeded %d users!\n", count)
	fmt.Println("\n📝 Login credentials:")
	fmt.Println("   test@test.com / password")
	fmt.Println("   test2@test.com / password2")
	fmt.Println("   test3@test.com / password3")
	fmt.Println("   ... etc.")

	return nil
}

// ClearTestUsers deletes all test users (emails matching test*@test.com)
func ClearTestUsers() error {
	collection := config.GetCollection("users")
	ctx := context.Background()

	// Delete all users with email matching pattern test*@test.com
	result, err := collection.DeleteMany(ctx, bson.M{
		"email": bson.M{
			"$regex": "^test.*@test\\.com$",
		},
	})

	if err != nil {
		return fmt.Errorf("failed to clear test users: %v", err)
	}

	fmt.Printf("🗑️  Cleared %d test users\n", result.DeletedCount)
	return nil
}
