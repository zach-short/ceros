package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/zach-short/final-web-programming/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Hub struct {
	clients    map[*Client]bool
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
	mutex      sync.RWMutex
}

type Client struct {
	hub    *Hub
	conn   *WebSocketConn
	send   chan []byte
	userID primitive.ObjectID
	rooms  map[string]bool
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Printf("Client connected: %s", client.userID.Hex())

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)

				for roomID := range client.rooms {
					h.removeFromRoom(client, roomID)
				}
			}
			h.mutex.Unlock()
			log.Printf("Client disconnected: %s", client.userID.Hex())

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) JoinRoom(client *Client, roomID string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if h.rooms[roomID] == nil {
		h.rooms[roomID] = make(map[*Client]bool)
	}
	h.rooms[roomID][client] = true
	client.rooms[roomID] = true

	log.Printf("Client %s joined room %s", client.userID.Hex(), roomID)
}

func (h *Hub) LeaveRoom(client *Client, roomID string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	h.removeFromRoom(client, roomID)
}

func (h *Hub) removeFromRoom(client *Client, roomID string) {
	if room, exists := h.rooms[roomID]; exists {
		delete(room, client)
		if len(room) == 0 {
			delete(h.rooms, roomID)
		}
	}
	delete(client.rooms, roomID)
}

func (h *Hub) BroadcastToRoom(roomID string, message models.WSMessage) {
	h.mutex.RLock()
	room, exists := h.rooms[roomID]
	h.mutex.RUnlock()

	if !exists {
		return
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.mutex.RLock()
	for client := range room {
		select {
		case client.send <- data:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
	h.mutex.RUnlock()
}

func (h *Hub) GetClientsInRoom(roomID string) []*Client {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	room, exists := h.rooms[roomID]
	if !exists {
		return nil
	}

	clients := make([]*Client, 0, len(room))
	for client := range room {
		clients = append(clients, client)
	}
	return clients
}

