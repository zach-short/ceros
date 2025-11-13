package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/zach-short/final-web-programming/config"
	"github.com/zach-short/final-web-programming/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000" || origin == "https://ceros.netlify.app"
	},
}

type WebSocketConn struct {
	*websocket.Conn
}

func NewClient(hub *Hub, conn *websocket.Conn, userID primitive.ObjectID) *Client {
	return &Client{
		hub:    hub,
		conn:   &WebSocketConn{conn},
		send:   make(chan []byte, 256),
		userID: userID,
		rooms:  make(map[string]bool),
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.Unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var wsMsg models.WSMessage
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		c.handleMessage(wsMsg)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleMessage(wsMsg models.WSMessage) {
	switch wsMsg.Action {
	case "join_room":
		if roomID, ok := wsMsg.Payload.(string); ok {
			c.hub.JoinRoom(c, roomID)
		}

	case "leave_room":
		if roomID, ok := wsMsg.Payload.(string); ok {
			c.hub.LeaveRoom(c, roomID)
		}

	case "send_message":
		c.handleSendMessage(wsMsg)

	case "reply_to_message":
		c.handleReplyToMessage(wsMsg)

	case "propose_motion":
		c.handleProposeMotion(wsMsg)

	case "second_motion":
		c.handleSecondMotion(wsMsg)

	case "vote_motion":
		c.handleVoteMotion(wsMsg)

	case "typing_start":
		c.handleTypingStart(wsMsg)

	case "typing_stop":
		c.handleTypingStop(wsMsg)

	default:
		log.Printf("Unknown action: %s", wsMsg.Action)
	}
}

func (c *Client) handleSendMessage(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid message payload")
		return
	}

	content, ok := payload["content"].(string)
	if !ok {
		log.Printf("Invalid message content")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	message := models.Message{
		ID:        primitive.NewObjectID(),
		Type:      wsMsg.Type,
		SenderID:  c.userID,
		Content:   content,
		RoomID:    roomID,
		Timestamp: time.Now(),
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Failed to save message to database: %v", err)
		return
	}

	log.Printf("Message saved: %s in room %s", content, roomID)

	usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var sender struct {
		ID      primitive.ObjectID `bson:"_id" json:"id"`
		Name    string             `bson:"name" json:"name"`
		Picture string             `bson:"picture" json:"picture"`
	}

	projection := bson.M{"_id": 1, "name": 1, "picture": 1}
	err = usersCollection.FindOne(ctx, bson.M{"_id": c.userID}, options.FindOne().SetProjection(projection)).Decode(&sender)
	if err != nil {
		log.Printf("Failed to fetch sender user data: %v", err)
		broadcastMsg := models.WSMessage{
			Action:  "new_message",
			Type:    message.Type,
			Payload: message,
		}
		c.hub.BroadcastToRoom(roomID, broadcastMsg)
		return
	}

	broadcastMsg := models.WSMessage{
		Action: "new_message",
		Type:   message.Type,
		Payload: map[string]any{
			"message": message,
			"sender":  sender,
		},
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func (c *Client) handleReplyToMessage(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid reply payload")
		return
	}

	content, ok := payload["content"].(string)
	if !ok {
		log.Printf("Invalid reply content")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	parentMessageIDStr, ok := payload["parentMessageId"].(string)
	if !ok {
		log.Printf("Invalid parent message ID")
		return
	}

	parentMessageID, err := primitive.ObjectIDFromHex(parentMessageIDStr)
	if err != nil {
		log.Printf("Invalid parent message ID format")
		return
	}

	message := models.Message{
		ID:              primitive.NewObjectID(),
		Type:            models.TypeReply,
		SenderID:        c.userID,
		Content:         content,
		RoomID:          roomID,
		ParentMessageID: &parentMessageID,
		Timestamp:       time.Now(),
	}

	collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Failed to save reply to database: %v", err)
		return
	}

	parentCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	_, err = parentCollection.UpdateOne(ctx,
		bson.M{"_id": parentMessageID},
		bson.M{"$inc": bson.M{"threadCount": 1}},
	)
	if err != nil {
		log.Printf("Failed to update thread count: %v", err)
	}

	usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var sender struct {
		ID      primitive.ObjectID `bson:"_id" json:"id"`
		Name    string             `bson:"name" json:"name"`
		Picture string             `bson:"picture" json:"picture"`
	}

	projection := bson.M{"_id": 1, "name": 1, "picture": 1}
	err = usersCollection.FindOne(ctx, bson.M{"_id": c.userID}, options.FindOne().SetProjection(projection)).Decode(&sender)
	if err != nil {
		log.Printf("Failed to fetch sender user data for reply: %v", err)
		broadcastMsg := models.WSMessage{
			Action:  "new_reply",
			Type:    message.Type,
			Payload: message,
		}
		c.hub.BroadcastToRoom(roomID, broadcastMsg)
		return
	}

	broadcastMsg := models.WSMessage{
		Action: "new_reply",
		Type:   message.Type,
		Payload: map[string]any{
			"message": message,
			"sender":  sender,
		},
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func (c *Client) handleProposeMotion(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid motion proposal payload")
		return
	}

	title, ok := payload["title"].(string)
	if !ok {
		log.Printf("Invalid motion title")
		return
	}

	description, ok := payload["description"].(string)
	if !ok {
		log.Printf("Invalid motion description")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	committeeIDStr, ok := payload["committeeId"].(string)
	if !ok {
		log.Printf("Invalid committee ID")
		return
	}

	committeeID, err := primitive.ObjectIDFromHex(committeeIDStr)
	if err != nil {
		log.Printf("Invalid committee ID format")
		return
	}

	// Check if there's already an active motion for this committee (following Robert's Rules - only one motion at a time)
	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existingMotion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{
		"committee_id": committeeID,
		"status": bson.M{"$in": []string{"proposed", "seconded", "open"}},
	}).Decode(&existingMotion)

	if err == nil {
		// There's already an active motion
		c.send <- []byte(`{"action":"error","payload":{"message":"There is already an active motion. Only one motion can be on the floor at a time per Robert's Rules of Order."}}`)
		return
	}

	// Create new motion in database
	motion := models.Motion{
		ID:          primitive.NewObjectID(),
		CommitteeID: committeeID,
		MoverID:     c.userID,
		Title:       title,
		Description: description,
		Status:      models.MotionStatusProposed,
		Votes:       []models.Vote{},
		Comments:    []models.Comment{},
		IsSpecial:   false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err = motionsCollection.InsertOne(ctx, motion)
	if err != nil {
		log.Printf("Failed to save motion to database: %v", err)
		c.send <- []byte(`{"action":"error","payload":{"message":"Failed to create motion"}}`)
		return
	}

	// Fetch mover user data
	usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var mover struct {
		ID      primitive.ObjectID `bson:"_id" json:"id"`
		Name    string             `bson:"name" json:"name"`
		Picture string             `bson:"picture" json:"picture"`
	}

	projection := bson.M{"_id": 1, "name": 1, "picture": 1}
	err = usersCollection.FindOne(ctx, bson.M{"_id": c.userID}, options.FindOne().SetProjection(projection)).Decode(&mover)
	if err != nil {
		log.Printf("Failed to fetch mover user data: %v", err)
	}

	// Create a special motion message in the chat
	message := models.Message{
		ID:        primitive.NewObjectID(),
		Type:      models.TypeMotion,
		SenderID:  c.userID,
		Content:   "proposed a motion",
		RoomID:    roomID,
		Timestamp: time.Now(),
		MotionID:  &motion.ID,
	}

	messagesCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("messages")
	_, err = messagesCollection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Failed to save motion message: %v", err)
	}

	broadcastMsg := models.WSMessage{
		Action: "motion_proposed",
		Type:   models.TypeMotion,
		Payload: map[string]any{
			"motion":  motion,
			"mover":   mover,
			"message": message,
		},
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func (c *Client) handleSecondMotion(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid second motion payload")
		return
	}

	motionIDStr, ok := payload["motionId"].(string)
	if !ok {
		log.Printf("Invalid motion ID")
		return
	}

	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		log.Printf("Invalid motion ID format")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	// Update motion in database with seconder and change status to "open" for voting
	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if motion exists and is in "proposed" status
	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		log.Printf("Motion not found: %v", err)
		c.send <- []byte(`{"action":"error","payload":{"message":"Motion not found"}}`)
		return
	}

	if motion.Status != models.MotionStatusProposed {
		c.send <- []byte(`{"action":"error","payload":{"message":"This motion has already been seconded or is no longer in proposed status"}}`)
		return
	}

	// Cannot second your own motion
	if motion.MoverID == c.userID {
		c.send <- []byte(`{"action":"error","payload":{"message":"You cannot second your own motion"}}`)
		return
	}

	// Update motion with seconder and open status
	update := bson.M{
		"$set": bson.M{
			"seconder_id": c.userID,
			"status":      models.MotionStatusOpen,
			"updated_at":  time.Now(),
		},
	}

	_, err = motionsCollection.UpdateOne(ctx, bson.M{"_id": motionID}, update)
	if err != nil {
		log.Printf("Failed to update motion: %v", err)
		c.send <- []byte(`{"action":"error","payload":{"message":"Failed to second motion"}}`)
		return
	}

	// Fetch updated motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		log.Printf("Failed to fetch updated motion: %v", err)
		return
	}

	// Fetch seconder user data
	usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var seconder struct {
		ID      primitive.ObjectID `bson:"_id" json:"id"`
		Name    string             `bson:"name" json:"name"`
		Picture string             `bson:"picture" json:"picture"`
	}

	projection := bson.M{"_id": 1, "name": 1, "picture": 1}
	err = usersCollection.FindOne(ctx, bson.M{"_id": c.userID}, options.FindOne().SetProjection(projection)).Decode(&seconder)
	if err != nil {
		log.Printf("Failed to fetch seconder user data: %v", err)
	}

	broadcastMsg := models.WSMessage{
		Action: "motion_seconded",
		Type:   models.TypeMotion,
		Payload: map[string]any{
			"motion":   motion,
			"seconder": seconder,
		},
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func (c *Client) handleVoteMotion(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid vote payload")
		return
	}

	motionIDStr, ok := payload["motionId"].(string)
	if !ok {
		log.Printf("Invalid motion ID")
		return
	}

	motionID, err := primitive.ObjectIDFromHex(motionIDStr)
	if err != nil {
		log.Printf("Invalid motion ID format")
		return
	}

	voteResult, ok := payload["vote"].(string)
	if !ok {
		log.Printf("Invalid vote result")
		return
	}

	// Validate vote result
	if voteResult != "aye" && voteResult != "nay" && voteResult != "abstain" {
		c.send <- []byte(`{"action":"error","payload":{"message":"Invalid vote. Must be 'aye', 'nay', or 'abstain'"}}`)
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	motionsCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("motions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if motion exists and is open for voting
	var motion models.Motion
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		log.Printf("Motion not found: %v", err)
		c.send <- []byte(`{"action":"error","payload":{"message":"Motion not found"}}`)
		return
	}

	if motion.Status != models.MotionStatusOpen {
		c.send <- []byte(`{"action":"error","payload":{"message":"This motion is not open for voting"}}`)
		return
	}

	// Check if user has already voted
	hasVoted := false
	voteIndex := -1
	for i, vote := range motion.Votes {
		if vote.UserID == c.userID {
			hasVoted = true
			voteIndex = i
			break
		}
	}

	// Create vote
	vote := models.Vote{
		ID:        primitive.NewObjectID(),
		MotionID:  motionID,
		UserID:    c.userID,
		Result:    models.VoteResult(voteResult),
		CreatedAt: time.Now(),
	}

	var update bson.M
	if hasVoted {
		// Update existing vote
		update = bson.M{
			"$set": bson.M{
				fmt.Sprintf("votes.%d", voteIndex): vote,
				"updated_at":                        time.Now(),
			},
		}
	} else {
		// Add new vote
		update = bson.M{
			"$push": bson.M{"votes": vote},
			"$set":  bson.M{"updated_at": time.Now()},
		}
	}

	_, err = motionsCollection.UpdateOne(ctx, bson.M{"_id": motionID}, update)
	if err != nil {
		log.Printf("Failed to record vote: %v", err)
		c.send <- []byte(`{"action":"error","payload":{"message":"Failed to record vote"}}`)
		return
	}

	// Fetch updated motion with all votes
	err = motionsCollection.FindOne(ctx, bson.M{"_id": motionID}).Decode(&motion)
	if err != nil {
		log.Printf("Failed to fetch updated motion: %v", err)
		return
	}

	// Fetch voter user data
	usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var voter struct {
		ID      primitive.ObjectID `bson:"_id" json:"id"`
		Name    string             `bson:"name" json:"name"`
		Picture string             `bson:"picture" json:"picture"`
	}

	projection := bson.M{"_id": 1, "name": 1, "picture": 1}
	err = usersCollection.FindOne(ctx, bson.M{"_id": c.userID}, options.FindOne().SetProjection(projection)).Decode(&voter)
	if err != nil {
		log.Printf("Failed to fetch voter user data: %v", err)
	}

	broadcastMsg := models.WSMessage{
		Action: "vote_cast",
		Type:   models.TypeMotion,
		Payload: map[string]any{
			"motion": motion,
			"vote":   vote,
			"voter":  voter,
		},
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func (c *Client) handleTypingStart(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid typing start payload")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID for typing")
		return
	}

	usersCollection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection("users")
	var user struct {
		ID      primitive.ObjectID `bson:"_id" json:"id"`
		Name    string             `bson:"name" json:"name"`
		Picture string             `bson:"picture" json:"picture"`
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	projection := bson.M{"_id": 1, "name": 1, "picture": 1}
	err := usersCollection.FindOne(ctx, bson.M{"_id": c.userID}, options.FindOne().SetProjection(projection)).Decode(&user)
	if err != nil {
		log.Printf("Failed to fetch user data for typing indicator: %v", err)
		return
	}

	broadcastMsg := models.WSMessage{
		Action: "user_typing",
		Type:   models.TypeSystem,
		Payload: map[string]any{
			"userId":   c.userID.Hex(),
			"roomId":   roomID,
			"isTyping": true,
			"name":     user.Name,
		},
	}

	c.hub.BroadcastToRoomExcept(roomID, broadcastMsg, c)
}

func (c *Client) handleTypingStop(wsMsg models.WSMessage) {
	payload, ok := wsMsg.Payload.(map[string]any)
	if !ok {
		log.Printf("Invalid typing stop payload")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID for typing stop")
		return
	}

	broadcastMsg := models.WSMessage{
		Action: "user_typing",
		Type:   models.TypeSystem,
		Payload: map[string]any{
			"userId":   c.userID.Hex(),
			"roomId":   roomID,
			"isTyping": false,
		},
	}

	c.hub.BroadcastToRoomExcept(roomID, broadcastMsg, c)
}

func UpgradeConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return upgrader.Upgrade(w, r, nil)
}
