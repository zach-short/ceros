import { User } from './user';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  requestedAt: string;
  respondedAt?: string;
  user?: User;
}