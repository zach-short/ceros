package websocket

import (
	"context"
	"encoding/json"
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

	broadcastMsg := models.WSMessage{
		Action: "motion_proposed",
		Type:   models.TypeMotion,
		Payload: map[string]any{
			"title":       title,
			"description": description,
			"moverID":     c.userID,
			"committeeID": committeeID,
			"status":      "proposed",
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

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	broadcastMsg := models.WSMessage{
		Action: "motion_seconded",
		Type:   models.TypeMotion,
		Payload: map[string]any{
			"motionId":   motionIDStr,
			"seconderId": c.userID,
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

	voteResult, ok := payload["vote"].(string)
	if !ok {
		log.Printf("Invalid vote result")
		return
	}

	roomID, ok := payload["roomId"].(string)
	if !ok {
		log.Printf("Invalid room ID")
		return
	}

	broadcastMsg := models.WSMessage{
		Action: "vote_cast",
		Type:   models.TypeMotion,
		Payload: map[string]any{
			"motionId": motionIDStr,
			"voterID":  c.userID,
			"vote":     voteResult,
		},
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func UpgradeConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return upgrader.Upgrade(w, r, nil)
}
