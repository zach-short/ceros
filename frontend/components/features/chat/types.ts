export interface Message {
  id: string;
  type: 'dm' | 'group' | 'motion' | 'system';
  senderId: string;
  content: string;
  roomId: string;
  timestamp: string;
}