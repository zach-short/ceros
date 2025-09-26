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

export interface ConversationUser {
  id: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

export interface ConversationSummary {
  roomId: string;
  type: 'dm' | 'group' | 'committee';
  participants: string[];
  otherUser?: ConversationUser; // For DMs only
  groupName?: string; // For groups/committees
  groupImage?: string; // For groups/committees
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

  editMessage: (messageId: string, content: string): Promise<any> =>
    apiRequest('put', `/messages/${messageId}`, { content }),

  deleteMessage: (messageId: string): Promise<any> =>
    apiRequest('delete', `/messages/${messageId}`),
};

