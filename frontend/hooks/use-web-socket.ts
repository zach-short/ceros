import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  type: 'dm' | 'group' | 'motion' | 'system';
  senderId: string;
  content: string;
  roomId: string;
  timestamp: string;
}

interface WSMessage {
  action: string;
  type: 'dm' | 'group' | 'motion' | 'system';
  payload: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  onMessage,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const { data: session } = useSession();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectionAttempted = useRef(false);
  const isConnecting = useRef(false);
  const [mounted, setMounted] = useState(false);

  const connect = useCallback(() => {
    if (
      !mounted ||
      ws.current?.readyState === WebSocket.OPEN ||
      !session?.apiToken ||
      isConnecting.current ||
      connectionAttempted.current
    )
      return;

    console.log('Attempting WebSocket connection...');
    isConnecting.current = true;
    connectionAttempted.current = true;

    const token = session.apiToken;
    const wsUrl =
      process.env.NODE_ENV !== 'development'
        ? `wss://ceros.up.railway.app/ws/chat?token=${token}`
        : `ws://localhost:8080/ws/chat?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
      isConnecting.current = false;
      onConnect?.();
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      isConnecting.current = false;
      onDisconnect?.();
    };

    ws.current.onerror = (error) => {
      setConnectionError('WebSocket connection failed');
      isConnecting.current = false;
      console.error('WebSocket error:', error);
    };

    ws.current.onmessage = (event) => {
      try {
        const wsMessage: WSMessage = JSON.parse(event.data);

        if (wsMessage.action === 'new_message') {
          onMessage?.(wsMessage.payload as Message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [mounted, session?.apiToken, onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    connectionAttempted.current = false;
    isConnecting.current = false;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(
    (roomId: string, content: string, type: 'dm' | 'group' = 'dm') => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message: WSMessage = {
          action: 'send_message',
          type,
          payload: {
            roomId,
            content,
          },
        };
        ws.current.send(JSON.stringify(message));
      }
    },
    [],
  );

  const joinRoom = useCallback((roomId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        action: 'join_room',
        type: 'dm',
        payload: roomId,
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        action: 'leave_room',
        type: 'dm',
        payload: roomId,
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && session?.apiToken) {
      const timeoutId = setTimeout(() => {
        connect();
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        disconnect();
      };
    }
  }, [mounted, session?.apiToken]);

  return {
    isConnected: mounted ? isConnected : false, // prevent hydration mismatch
    connectionError,
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
  };
}
