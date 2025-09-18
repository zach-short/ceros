package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"github.com/zach-short/final-web-programming/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UpdateProfileRequest struct {
	Name        *string         `json:"name,omitempty"`
	GivenName   *string         `json:"givenName,omitempty"`
	FamilyName  *string         `json:"familyName,omitempty"`
	Bio         *string         `json:"bio,omitempty"`
	Picture     *string         `json:"picture,omitempty"`
	PhoneNumber *string         `json:"phoneNumber,omitempty"`
	Address     *models.Address `json:"address,omitempty"`
}

type CheckUsernameRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateUserSettingsRequest struct {
	Theme                       *string                      `json:"theme,omitempty"`
	AutoAcceptFriendInvitations *bool                        `json:"autoAcceptFriendInvitations,omitempty"`
	Privacy                     *models.PrivacySettings      `json:"privacy,omitempty"`
	Notifications               *models.NotificationSettings `json:"notifications,omitempty"`
}

func GetPublicProfile(c *gin.Context) {
	userId := c.Param("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	currentUserIdStr := c.GetString("userID")
	var currentUserID primitive.ObjectID
	isAuthenticated := false
	if currentUserIdStr != "" {
		currentUserID, err = primitive.ObjectIDFromHex(currentUserIdStr)
		if err == nil {
			isAuthenticated = true
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")
	var user models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	user.PasswordHash = ""

	settings := user.Settings
	if settings == (models.UserSettings{}) {
		settings = models.GetDefaultUserSettings()
	}

	isFriend := false
	if isAuthenticated && userID != currentUserID {
		friendshipStatus, err := getFriendshipStatus(ctx, currentUserID, userID)
		if err == nil && friendshipStatus != nil {
			status := friendshipStatus["status"].(string)
			isFriend = status == "accepted"
		}
	}

	response := map[string]any{
		"id":   user.ID.Hex(),
		"name": user.Name,
	}

	if settings.Privacy.ShowEmail || isFriend {
		response["email"] = user.Email
	}
	if settings.Privacy.ShowGivenName || isFriend {
		response["givenName"] = user.GivenName
	}
	if settings.Privacy.ShowFamilyName || isFriend {
		response["familyName"] = user.FamilyName
	}
	if settings.Privacy.ShowPicture || isFriend {
		response["picture"] = user.Picture
	}
	if settings.Privacy.ShowBio || isFriend {
		response["bio"] = user.Bio
	}
	if settings.Privacy.ShowPhoneNumber || isFriend {
		response["phoneNumber"] = user.PhoneNumber
	}
	if settings.Privacy.ShowAddress || isFriend {
		response["address"] = user.Address
	}

	committees, err := getUserCommittees(ctx, userID)
	if err == nil {
		response["committees"] = committees
	}

	if isAuthenticated && userID != currentUserID {
		friendshipStatus, err := getFriendshipStatus(ctx, currentUserID, userID)
		if err == nil && friendshipStatus != nil {
			response["friendshipStatus"] = friendshipStatus
		}

		mutualFriendsCount, err := getMutualFriendsCount(ctx, currentUserID, userID)
		if err == nil {
			response["mutualFriendsCount"] = mutualFriendsCount
		}
	}

	response["isOwnProfile"] = isAuthenticated && userID == currentUserID

	c.JSON(http.StatusOK, response)
}

func GetMe(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")
	var user models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	user.PasswordHash = ""
	fmt.Println(user, "user in /Projects/wm-courses/3-fall-2025/web-programming/final-web-programming/backend/handlers/users.go")
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")

	if req.Name != nil && *req.Name != "" {
		var existingUser models.User
		err := collection.FindOne(ctx, bson.M{
			"name": *req.Name,
			"_id":  bson.M{"$ne": userID},
		}).Decode(&existingUser)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
			return
		} else if err != mongo.ErrNoDocuments {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}
	}

	updateDoc := bson.M{}
	if req.Name != nil {
		updateDoc["name"] = *req.Name
	}
	if req.GivenName != nil {
		updateDoc["givenName"] = *req.GivenName
	}
	if req.FamilyName != nil {
		updateDoc["familyName"] = *req.FamilyName
	}
	if req.Bio != nil {
		updateDoc["bio"] = *req.Bio
	}
	if req.Picture != nil {
		updateDoc["picture"] = *req.Picture
	}
	if req.PhoneNumber != nil {
		updateDoc["phoneNumber"] = *req.PhoneNumber
	}
	if req.Address != nil {
		updateDoc["address"] = *req.Address
	}

	if len(updateDoc) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	update := bson.M{"$set": updateDoc}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var updatedUser models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated user"})
		return
	}

	updatedUser.PasswordHash = ""
	c.JSON(http.StatusOK, updatedUser)
}

func CheckUsername(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name parameter is required"})
		return
	}

	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")
	var existingUser models.User
	err = collection.FindOne(ctx, bson.M{
		"name": name,
		"_id":  bson.M{"$ne": userID},
	}).Decode(&existingUser)

	available := err == mongo.ErrNoDocuments
	if err != nil && err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"available": available})
}

func UpdateUserSettings(c *gin.Context) {
	userId := c.GetString("userID")
	userID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var req UpdateUserSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.GetCollection("users")

	var currentUser models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&currentUser)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	settings := currentUser.Settings
	if settings == (models.UserSettings{}) {
		settings = models.GetDefaultUserSettings()
	}

	if req.Theme != nil {
		settings.Theme = *req.Theme
	}
	if req.AutoAcceptFriendInvitations != nil {
		settings.AutoAcceptFriendInvitations = *req.AutoAcceptFriendInvitations
	}
	if req.Privacy != nil {
		settings.Privacy.ShowEmail = req.Privacy.ShowEmail
		settings.Privacy.ShowPhoneNumber = req.Privacy.ShowPhoneNumber
		settings.Privacy.ShowAddress = req.Privacy.ShowAddress
		settings.Privacy.ShowGivenName = req.Privacy.ShowGivenName
		settings.Privacy.ShowFamilyName = req.Privacy.ShowFamilyName
		settings.Privacy.ShowBio = req.Privacy.ShowBio
		settings.Privacy.ShowPicture = req.Privacy.ShowPicture
	}
	if req.Notifications != nil {
		settings.Notifications.EmailNotifications = req.Notifications.EmailNotifications
		settings.Notifications.CommitteeInvitations = req.Notifications.CommitteeInvitations
		settings.Notifications.MotionNotifications = req.Notifications.MotionNotifications
		settings.Notifications.VoteNotifications = req.Notifications.VoteNotifications
		settings.Notifications.FriendRequestNotifications = req.Notifications.FriendRequestNotifications
	}

	update := bson.M{"$set": bson.M{"settings": settings}}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": userID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var updatedUser models.User
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated user"})
		return
	}

	updatedUser.PasswordHash = ""
	c.JSON(http.StatusOK, updatedUser)
}

func getUserCommittees(ctx context.Context, userID primitive.ObjectID) ([]map[string]any, error) {
	committees := []map[string]any{}

	query := bson.M{
		"$or": []bson.M{
			{"owner_id": userID},
			{"chair_id": userID},
			{"member_ids": userID},
			{"observer_ids": userID},
		},
	}

	committeeItems, err := utils.FetchItems(query, "committees")
	if err != nil {
		return committees, err
	}

	for _, item := range committeeItems {
		role := "Observer"
		if item["owner_id"] == userID {
			role = "Owner"
		} else if item["chair_id"] == userID {
			role = "Chair"
		} else if memberIDs, ok := item["member_ids"].(primitive.A); ok {
			for _, memberID := range memberIDs {
				if memberID == userID {
					role = "Member"
					break
				}
			}
		}

		committee := map[string]any{
			"id":   item["_id"],
			"name": item["name"],
			"type": item["type"],
			"role": role,
		}
		committees = append(committees, committee)
	}

	return committees, nil
}

func getFriendshipStatus(ctx context.Context, currentUserID, targetUserID primitive.ObjectID) (map[string]any, error) {
	query := bson.M{
		"$or": []bson.M{
			{"requesterId": currentUserID, "addresseeId": targetUserID},
			{"requesterId": targetUserID, "addresseeId": currentUserID},
		},
	}

	friendship, err := utils.FetchItem(query, "friendships")
	if err != nil || friendship == nil {
		return nil, err
	}

	status := friendship["status"].(string)
	requesterID := friendship["requesterId"].(primitive.ObjectID)
	addresseeID := friendship["addresseeId"].(primitive.ObjectID)

	isPendingFromMe := requesterID == currentUserID && status == "pending"
	isPendingToMe := addresseeID == currentUserID && status == "pending"

	return map[string]any{
		"status":          status,
		"isPendingFromMe": isPendingFromMe,
		"isPendingToMe":   isPendingToMe,
		"friendshipId":    friendship["_id"],
	}, nil
}

func getMutualFriendsCount(ctx context.Context, user1ID, user2ID primitive.ObjectID) (int, error) {
	user1FriendsQuery := bson.M{
		"status": models.FriendStatusAccepted,
		"$or": []bson.M{
			{"requesterId": user1ID},
			{"addresseeId": user1ID},
		},
	}

	user1Friendships, err := utils.FetchItems(user1FriendsQuery, "friendships")
	if err != nil {
		return 0, err
	}

	user1Friends := make(map[primitive.ObjectID]bool)
	for _, friendship := range user1Friendships {
		requesterID := friendship["requesterId"].(primitive.ObjectID)
		addresseeID := friendship["addresseeId"].(primitive.ObjectID)

		if requesterID == user1ID {
			user1Friends[addresseeID] = true
		} else {
			user1Friends[requesterID] = true
		}
	}

	user2FriendsQuery := bson.M{
		"status": models.FriendStatusAccepted,
		"$or": []bson.M{
			{"requesterId": user2ID},
			{"addresseeId": user2ID},
		},
	}

	user2Friendships, err := utils.FetchItems(user2FriendsQuery, "friendships")
	if err != nil {
		return 0, err
	}

	mutualCount := 0
	for _, friendship := range user2Friendships {
		requesterID := friendship["requesterId"].(primitive.ObjectID)
		addresseeID := friendship["addresseeId"].(primitive.ObjectID)

		var friendID primitive.ObjectID
		if requesterID == user2ID {
			friendID = addresseeID
		} else {
			friendID = requesterID
		}

		if user1Friends[friendID] {
			mutualCount++
		}
	}

	return mutualCount, nil
}
