package handlers

import (
	"context"
	"net/http"
	"os"
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

	c.JSON(http.StatusOK, gin.H{"motion": motion})
}

func UpdateMotion(c *gin.Context) {
	motionIDStr := c.Param("motionId")
	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid motion ID"})
		return
	}

	var updateReq struct {
		Status     *models.MotionStatus `json:"status,omitempty"`
		SeconderID *primitive.ObjectID  `json:"seconderId,omitempty"`
	}

	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{"updated_at": time.Now()}}
	if updateReq.Status != nil {
		update["$set"].(bson.M)["status"] = *updateReq.Status
	}
	if updateReq.SeconderID != nil {
		update["$set"].(bson.M)["seconder_id"] = *updateReq.SeconderID
	}

	result, err := motionsCollection.UpdateOne(ctx, bson.M{"_id": motionID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update motion"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Motion not found"})
		return
	}

	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated motion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"motion": motion})
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
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = motionsCollection.InsertOne(ctx, motion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create motion"})
		return
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
	}

	update := bson.M{
		"$set": bson.M{
			"status":     newStatus,
			"vote_tally": tally,
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
