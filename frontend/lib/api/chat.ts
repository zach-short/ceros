import { apiRequest } from '../api';

export interface Message {
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
  metadata?: Record<string, any>;
}

export interface Room {
  id: string;
  type: 'dm' | 'group';
  participants: string[];
  createdAt: string;
  updatedAt: string;
  name?: string;
  description?: string;
}

export interface StartDMRequest {
  recipientId: string;
}

export interface StartDMResponse {
  roomId: string;
  room: Room;
}

export interface GetDMHistoryResponse {
  roomId: string;
  messages: Message[];
}

export interface ConversationSummary {
  roomId: string;
  type: 'dm' | 'group';
  participants: string[];
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount: number;
}

export interface GetConversationsResponse {
  conversations: ConversationSummary[];
}

export const chatApi = {
  startDM: (data: StartDMRequest): Promise<any> =>
    apiRequest('post', '/chat/dm/start', data),

  getDMHistory: (recipientId: string): Promise<any> =>
    apiRequest('get', `/chat/dm/${recipientId}/history`),

  getConversations: (): Promise<any> =>
    apiRequest('get', '/chat/conversations'),

  getMessageReplies: (messageId: string): Promise<any> =>
    apiRequest('get', `/messages/${messageId}/replies`),

  toggleMessageReaction: (messageId: string, emoji: string): Promise<any> =>
    apiRequest('post', `/messages/${messageId}/reaction`, { emoji }),
};

