package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/zach-short/final-web-programming/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
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
		c.hub.unregister <- c
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

	broadcastMsg := models.WSMessage{
		Action:  "new_message",
		Type:    message.Type,
		Payload: message,
	}

	c.hub.BroadcastToRoom(roomID, broadcastMsg)
}

func UpgradeConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return upgrader.Upgrade(w, r, nil)
}

