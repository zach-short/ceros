import { apiRequest } from '../api';

export interface CommitteeRoom {
  id: string;
  type: 'committee';
  ownerId: string;
  committeeId: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  description?: string;
}

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

export interface StartCommitteeChatRequest {
  committeeId: string;
}

export interface StartCommitteeChatResponse {
  roomId: string;
  room: CommitteeRoom;
}

export interface GetCommitteeHistoryResponse {
  roomId: string;
  messages: Message[];
  users: any[];
}

export interface GetMessageRepliesResponse {
  replies: Message[];
}

export const committeeApi = {
  startChat: (committeeId: string): Promise<any> =>
    apiRequest('post', `/committees/${committeeId}/chat/start`),

  getHistory: (committeeId: string): Promise<any> =>
    apiRequest('get', `/committees/${committeeId}/chat/history`),

  getMessageReplies: (messageId: string): Promise<any> =>
    apiRequest('get', `/messages/${messageId}/replies`),

  toggleMessageReaction: (messageId: string, emoji: string): Promise<any> =>
    apiRequest('post', `/messages/${messageId}/reaction`, { emoji }),

  editMessage: (messageId: string, content: string): Promise<any> =>
    apiRequest('put', `/messages/${messageId}`, { content }),

  deleteMessage: (messageId: string): Promise<any> =>
    apiRequest('delete', `/messages/${messageId}`),
};