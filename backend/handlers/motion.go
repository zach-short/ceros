package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"github.com/zach-short/final-web-programming/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetCommitteeMotions(c *gin.Context) {
	committeeIDStr := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{
		"_id": committeeID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
			{"memberIds": userID},
			{"observerIds": userID},
		},
	}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to view this committee's motions"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	cursor, err := motionsCollection.Find(ctx, bson.M{"committee_id": committeeID}, options.Find().SetSort(bson.M{"created_at": -1}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch motions"})
		return
	}
	defer cursor.Close(ctx)

	var motions []models.Motion
	if err = cursor.All(ctx, &motions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse motions"})
		return
	}

	if motions == nil {
		motions = []models.Motion{}
	}

	c.JSON(http.StatusOK, gin.H{"motions": motions})
}

func GetMotion(c *gin.Context) {
	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{
		"_id": motion.CommitteeID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
			{"memberIds": userID},
			{"observerIds": userID},
		},
	}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to view this motion"})
		return
	}

	roomID := models.CreateCommitteeRoomID(motion.CommitteeID)
	messagesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")

	endTime := time.Now()
	if motion.Status == models.MotionStatusPassed || motion.Status == models.MotionStatusFailed || motion.Status == models.MotionStatusTabled {

		endTime = motion.UpdatedAt
	}

	messageFilter := bson.M{
		"roomId": roomID,
		"timestamp": bson.M{
			"$gte": motion.CreatedAt,
			"$lte": endTime,
		},
	}
	messageOpts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: 1}}).SetLimit(100)

	messageCursor, err := messagesCollection.Find(ctx, messageFilter, messageOpts)
	var messages []models.Message
	if err != nil {
		log.Printf("Error fetching discussion messages: %v", err)
		messages = []models.Message{}
	} else {
		defer messageCursor.Close(ctx)
		if err = messageCursor.All(ctx, &messages); err != nil {
			log.Printf("Error decoding discussion messages: %v", err)
			messages = []models.Message{}
		}
	}

	// Filter out motion-type messages and collect unique user IDs
	filteredMessages := make([]models.Message, 0)
	uniqueUserIDs := make(map[primitive.ObjectID]bool)
	for _, msg := range messages {
		if msg.Type != models.TypeMotion {
			filteredMessages = append(filteredMessages, msg)
		}
		uniqueUserIDs[msg.SenderID] = true
	}

	uniqueUserIDs[motion.MoverID] = true
	if motion.SeconderID != nil {
		uniqueUserIDs[*motion.SeconderID] = true
	}

	var userIDList []primitive.ObjectID
	for userID := range uniqueUserIDs {
		userIDList = append(userIDList, userID)
	}

	var users []models.User
	if len(userIDList) > 0 {
		usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
		userFilter := bson.M{"_id": bson.M{"$in": userIDList}}
		userCursor, err := usersCollection.Find(ctx, userFilter)
		if err != nil {
			log.Printf("Error fetching users: %v", err)
			users = []models.User{}
		} else {
			defer userCursor.Close(ctx)
			if err = userCursor.All(ctx, &users); err != nil {
				log.Printf("Error decoding users: %v", err)
				users = []models.User{}
			}
		}
	}

	// Create discussion entries for backward compatibility
	discussion := make([]models.DiscussionEntry, 0, len(filteredMessages))
	for _, msg := range filteredMessages {
		discussion = append(discussion, models.DiscussionEntry{
			MessageID: msg.ID,
			UserID:    msg.SenderID,
			Content:   msg.Content,
			CreatedAt: msg.Timestamp,
		})
	}

	// Update motion with discussion
	motion.Discussion = discussion

	c.JSON(http.StatusOK, gin.H{
		"motion":   motion,
		"users":    users,
		"messages": filteredMessages,
	})
}

func UpdateMotion(c *gin.Context) {
	committeeIDStr := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get the motion first
	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	// Get committee for permission checking
	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{"_id": committeeID}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Committee not found"})
		return
	}

	// Parse request body
	var updateReq models.UpdateMotionDetailsRequest
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if motion is closed (can't edit closed motions)
	if motion.Status == models.MotionStatusPassed || motion.Status == models.MotionStatusFailed {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot edit a closed motion"})
		return
	}

	// Permission check for editing details (title, description, vote_threshold)
	if updateReq.Title != nil || updateReq.Description != nil || updateReq.VoteThreshold != nil {
		// Can edit if: owner, chair, or proposer
		isOwner := committee.OwnerID == userID
		isChair := !committee.ChairID.IsZero() && committee.ChairID == userID
		isProposer := motion.MoverID == userID

		canEdit := isOwner || isChair || isProposer

		if !canEdit {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only the motion proposer, committee chair, or owner can edit motion details"})
			return
		}
	}

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if updateReq.Title != nil {
		update["$set"].(bson.M)["title"] = *updateReq.Title
	}
	if updateReq.Description != nil {
		update["$set"].(bson.M)["description"] = *updateReq.Description
	}
	if updateReq.VoteThreshold != nil {
		update["$set"].(bson.M)["vote_threshold"] = *updateReq.VoteThreshold
	}

	// Keep existing status/seconder update logic
	if updateReq.Status != nil {
		update["$set"].(bson.M)["status"] = *updateReq.Status
	}
	if updateReq.SeconderID != nil {
		update["$set"].(bson.M)["seconder_id"] = *updateReq.SeconderID
	}

	// Perform update
	_, err = motionsCollection.UpdateOne(
		ctx,
		bson.M{"_id": motionID},
		update,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update motion"})
		return
	}

	// Fetch and return updated motion
	var updatedMotion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&updatedMotion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated motion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"motion": updatedMotion})
}

func CreateMotion(c *gin.Context) {
	committeeIDStr := c.Param("id")
	if committeeIDStr == "" {
		committeeIDStr = c.Param("comitteeId")
	}
	if committeeIDStr == "" {
		committeeIDStr = c.Param("committeeId")
	}
	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var createReq struct {
		Title          string                `json:"title" binding:"required"`
		Description    string                `json:"description" binding:"required"`
		VoteThreshold  *models.VoteThreshold `json:"voteThreshold,omitempty"`
		RequiresQuorum *bool                 `json:"requiresQuorum,omitempty"`
	}

	if err := c.ShouldBindJSON(&createReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{
		"_id": committeeID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
			{"memberIds": userID},
		},
	}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to create motions for this committee"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	var existingMotion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{
		"committee_id": committeeID,
		"status":       bson.M{"$in": []string{"proposed", "seconded", "open"}},
	}).Decode(&existingMotion)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "There is already an active motion. Only one motion can be on the floor at a time per Robert's Rules of Order."})
		return
	}

	voteThreshold := committee.VotingRules.DefaultThreshold
	if createReq.VoteThreshold != nil {
		voteThreshold = *createReq.VoteThreshold
	}

	requiresQuorum := true
	if createReq.RequiresQuorum != nil {
		requiresQuorum = *createReq.RequiresQuorum
	}

	motion := models.Motion{
		ID:             primitive.NewObjectID(),
		CommitteeID:    committeeID,
		MoverID:        userID,
		Title:          createReq.Title,
		Description:    createReq.Description,
		Status:         models.MotionStatusProposed,
		VoteThreshold:  voteThreshold,
		RequiresQuorum: requiresQuorum,
		Votes:          []models.Vote{},
		Comments:       []models.Comment{},
		IsSpecial:      false,
		MotionType:     models.MotionTypeMain,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = motionsCollection.InsertOne(ctx, motion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create motion"})
		return
	}

	// Create a message for the motion in the committee chat
	roomID := models.CreateCommitteeRoomID(committeeID)
	message := models.Message{
		ID:        primitive.NewObjectID(),
		Type:      models.TypeMotion,
		SenderID:  userID,
		Content:   "proposed a motion",
		RoomID:    roomID,
		Timestamp: time.Now(),
		MotionID:  &motion.ID,
	}

	messagesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	_, err = messagesCollection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Failed to save motion message: %v", err)
		// Don't fail the request if message creation fails
	}

	c.JSON(http.StatusCreated, gin.H{"motion": motion})
}

func DeleteMotion(c *gin.Context) {
	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{
		"_id": motion.CommitteeID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
		},
	}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this motion"})
		return
	}

	_, err = motionsCollection.DeleteOne(ctx, bson.M{"_id": motionID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete motion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Motion deleted successfully"})
}

func CloseMotion(c *gin.Context) {
	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	if motion.Status != models.MotionStatusOpen {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Motion is not open for voting"})
		return
	}

	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{
		"_id": motion.CommitteeID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"chairId": userID},
		},
	}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chair or owner can close voting"})
		return
	}

	tally := utils.CalculateVoteTally(&motion, &committee)

	if motion.RequiresQuorum && !tally.QuorumMet {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quorum not met. Cannot close motion."})
		return
	}

	passed := utils.CalculatePassed(tally, motion.VoteThreshold)
	now := time.Now()
	tally.TalliedAt = &now
	tally.Passed = &passed

	newStatus := models.MotionStatusFailed
	if passed {
		newStatus = models.MotionStatusPassed

		if motion.MotionType == models.MotionTypeToTable && motion.ParentMotionID != nil {
			_, err := motionsCollection.UpdateOne(
				ctx,
				bson.M{"_id": *motion.ParentMotionID},
				bson.M{
					"$set": bson.M{
						"status":     models.MotionStatusTabled,
						"updated_at": time.Now(),
					},
				},
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to table parent motion"})
				return
			}
		}
	}

	summary := generateMotionSummary(&motion, tally)

	update := bson.M{
		"$set": bson.M{
			"status":     newStatus,
			"vote_tally": tally,
			"summary":    summary,
			"updated_at": now,
		},
	}

	_, err = motionsCollection.UpdateOne(ctx, bson.M{"_id": motionID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to close motion"})
		return
	}

	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated motion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"motion": motion, "tally": tally, "passed": passed})
}

func CreateMotionToTable(c *gin.Context) {
	committeeIDStr := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var targetMotion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&targetMotion)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	if targetMotion.Status != models.MotionStatusProposed && targetMotion.Status != models.MotionStatusSeconded && targetMotion.Status != models.MotionStatusOpen {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Can only table active motions"})
		return
	}

	var existingTableMotion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{
		"committee_id":     committeeID,
		"parent_motion_id": motionID,
		"motion_type":      models.MotionTypeToTable,
		"status":           bson.M{"$in": []string{string(models.MotionStatusProposed), string(models.MotionStatusSeconded), string(models.MotionStatusOpen)}},
	}).Decode(&existingTableMotion)

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A motion to table is already pending for this motion"})
		return
	}

	tableMotion := models.Motion{
		ID:             primitive.NewObjectID(),
		CommitteeID:    committeeID,
		MoverID:        userID,
		Title:          fmt.Sprintf("Motion to Table: %s", targetMotion.Title),
		Description:    "Postpone this motion indefinitely",
		Status:         models.MotionStatusProposed,
		VoteThreshold:  models.VoteThresholdSimpleMajority,
		RequiresQuorum: false,
		Votes:          []models.Vote{},
		Comments:       []models.Comment{},
		IsSpecial:      true,
		MotionType:     models.MotionTypeToTable,
		ParentMotionID: &motionID,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = motionsCollection.InsertOne(ctx, tableMotion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create motion to table"})
		return
	}

	// Create a message for the motion in the committee chat
	roomID := models.CreateCommitteeRoomID(committeeID)
	message := models.Message{
		ID:        primitive.NewObjectID(),
		Type:      models.TypeMotion,
		SenderID:  userID,
		Content:   "proposed a motion",
		RoomID:    roomID,
		Timestamp: time.Now(),
		MotionID:  &tableMotion.ID,
	}

	messagesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	_, err = messagesCollection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Failed to save motion message: %v", err)
		// Don't fail the request if message creation fails
	}

	c.JSON(http.StatusCreated, gin.H{"motion": tableMotion})
}

func UntableMotion(c *gin.Context) {
	committeeIDStr := c.Param("id")
	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid committee ID"})
		return
	}

	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	committeesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("committees")
	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var committee models.Committee
	err = committeesCollection.FindOne(ctx, bson.M{"_id": committeeID}).Decode(&committee)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Committee not found"})
		return
	}

	isOwner := committee.OwnerID == userID
	isChair := !committee.ChairID.IsZero() && committee.ChairID == userID

	if !isOwner && !isChair {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chair or owner can take motion from table"})
		return
	}

	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	if motion.Status != models.MotionStatusTabled {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Motion is not tabled"})
		return
	}

	count, err := motionsCollection.CountDocuments(ctx, bson.M{
		"committee_id": committeeID,
		"status":       bson.M{"$in": []string{string(models.MotionStatusProposed), string(models.MotionStatusSeconded), string(models.MotionStatusOpen)}},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check for active motions"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot untable while another motion is active"})
		return
	}

	restoredStatus := models.MotionStatusProposed
	if motion.SeconderID != nil {
		restoredStatus = models.MotionStatusSeconded
	}

	_, err = motionsCollection.UpdateOne(
		ctx,
		bson.M{"_id": motionID},
		bson.M{
			"$set": bson.M{
				"status":     restoredStatus,
				"updated_at": time.Now(),
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to untable motion"})
		return
	}

	var updatedMotion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&updatedMotion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated motion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"motion": updatedMotion})
}

func generateMotionSummary(motion *models.Motion, tally *models.VoteTally) string {
	var summary strings.Builder

	summary.WriteString(fmt.Sprintf("Motion: %s\n\n", motion.Title))

	if len(motion.Discussion) > 0 {
		summary.WriteString("Discussion Summary:\n")
		summary.WriteString(fmt.Sprintf("- %d messages exchanged during deliberation\n", len(motion.Discussion)))
	}

	if tally != nil {
		summary.WriteString(fmt.Sprintf("\nVoting Results:\n"))
		summary.WriteString(fmt.Sprintf("- Aye: %d\n", tally.AyeCount))
		summary.WriteString(fmt.Sprintf("- Nay: %d\n", tally.NayCount))
		summary.WriteString(fmt.Sprintf("- Abstain: %d\n", tally.AbstainCount))
	}

	return summary.String()
}
