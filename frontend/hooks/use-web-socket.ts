import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  type: 'dm' | 'group' | 'motion' | 'system' | 'reply';
  senderId: string;
  content: string;
  roomId: string;
  timestamp: string;
  parentMessageId?: string;
  threadCount?: number;
  motionId?: string;
  voteId?: string;
}

interface WSMessage {
  action: string;
  type: 'dm' | 'group' | 'motion' | 'system' | 'reply';
  payload: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: Message) => void;
  onReactionUpdate?: (data: { messageId: string; reactions: any[] }) => void;
  onTypingUpdate?: (data: { userId: string; roomId: string; isTyping: boolean; name?: string }) => void;
  onReadReceiptUpdate?: (data: { messageIds: string[]; readBy: string; readAt: string; roomId: string }) => void;
  onMessageDelivered?: (data: { messageId: string; deliveredAt: string; roomId: string }) => void;
  onPinToggled?: (data: { messageId: string; isPinned: boolean; pinnedBy: string; pinnedAt: string; roomId: string }) => void;
  onUserStatusChanged?: (data: { userId: string; isOnline: boolean; lastSeen: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  onMessage,
  onReactionUpdate,
  onTypingUpdate,
  onReadReceiptUpdate,
  onMessageDelivered,
  onPinToggled,
  onUserStatusChanged,
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

        if (
          wsMessage.action === 'new_message' ||
          wsMessage.action === 'new_reply'
        ) {
          onMessage?.(wsMessage.payload as Message);
        } else if (wsMessage.action === 'reaction_update') {
          onReactionUpdate?.(
            wsMessage.payload as { messageId: string; reactions: any[] },
          );
        } else if (wsMessage.action === 'user_typing') {
          onTypingUpdate?.(
            wsMessage.payload as { userId: string; roomId: string; isTyping: boolean; name?: string },
          );
        } else if (wsMessage.action === 'messages_read') {
          onReadReceiptUpdate?.(
            wsMessage.payload as { messageIds: string[]; readBy: string; readAt: string; roomId: string },
          );
        } else if (wsMessage.action === 'message_delivered') {
          onMessageDelivered?.(
            wsMessage.payload as { messageId: string; deliveredAt: string; roomId: string },
          );
        } else if (wsMessage.action === 'message_pin_toggled') {
          onPinToggled?.(
            wsMessage.payload as { messageId: string; isPinned: boolean; pinnedBy: string; pinnedAt: string; roomId: string },
          );
        } else if (wsMessage.action === 'user_status_changed') {
          onUserStatusChanged?.(
            wsMessage.payload as { userId: string; isOnline: boolean; lastSeen: string },
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [
    mounted,
    session?.apiToken,
    onMessage,
    onReactionUpdate,
    onTypingUpdate,
    onReadReceiptUpdate,
    onMessageDelivered,
    onPinToggled,
    onUserStatusChanged,
    onConnect,
    onDisconnect,
  ]);

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
    (
      roomId: string,
      content: string,
      type: 'dm' | 'group' | 'motion' = 'group',
    ) => {
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

  const replyToMessage = useCallback(
    (roomId: string, content: string, parentMessageId: string) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message: WSMessage = {
          action: 'reply_to_message',
          type: 'reply',
          payload: {
            roomId,
            content,
            parentMessageId,
          },
        };
        ws.current.send(JSON.stringify(message));
      }
    },
    [],
  );

  const proposeMotion = useCallback(
    (
      roomId: string,
      title: string,
      description: string,
      committeeId: string,
    ) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message: WSMessage = {
          action: 'propose_motion',
          type: 'motion',
          payload: {
            roomId,
            title,
            description,
            committeeId,
          },
        };
        ws.current.send(JSON.stringify(message));
      }
    },
    [],
  );

  const secondMotion = useCallback((roomId: string, motionId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        action: 'second_motion',
        type: 'motion',
        payload: {
          roomId,
          motionId,
        },
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const voteOnMotion = useCallback(
    (roomId: string, motionId: string, vote: 'aye' | 'nay' | 'abstain') => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message: WSMessage = {
          action: 'vote_motion',
          type: 'motion',
          payload: {
            roomId,
            motionId,
            vote,
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

  const sendTypingStart = useCallback((roomId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        action: 'typing_start',
        type: 'system',
        payload: { roomId },
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const sendTypingStop = useCallback((roomId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        action: 'typing_stop',
        type: 'system',
        payload: { roomId },
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
    isConnected: mounted ? isConnected : false,
    connectionError,
    sendMessage,
    replyToMessage,
    proposeMotion,
    secondMotion,
    voteOnMotion,
    joinRoom,
    leaveRoom,
    sendTypingStart,
    sendTypingStop,
    connect,
    disconnect,
  };
}
