import { apiRequest } from '../api';
import { User, Friendship } from '@/models';
import type {
  AddFriendRequest,
  BlockUserRequest
} from '@/types';

export type { User, Friendship };

export const friendsApi = {
  getAll: (): Promise<any> => apiRequest('get', '/users/me/friends'),

  getPending: (): Promise<any> =>
    apiRequest('get', '/users/me/friends/pending'),

  getSent: (): Promise<any> => apiRequest('get', '/users/me/friends/sent'),

  getFriendship: (friendshipId: string): Promise<any> =>
    apiRequest('get', `/users/me/friends/${friendshipId}`),

  requestFriend: (data: AddFriendRequest): Promise<any> =>
    apiRequest('post', '/users/me/friends/request', data),

  acceptFriend: (friendshipId: string): Promise<any> =>
    apiRequest('post', `/users/me/friends/${friendshipId}/accept`),

  rejectFriend: (friendshipId: string): Promise<any> =>
    apiRequest('post', `/users/me/friends/${friendshipId}/reject`),

  blockUser: (data: BlockUserRequest): Promise<any> =>
    apiRequest('post', '/users/me/friends/block', data),

  removeFriend: (friendshipId: string): Promise<any> =>
    apiRequest('delete', `/users/me/friends/${friendshipId}`),

  unblockUser: (friendshipId: string): Promise<any> =>
    apiRequest('delete', `/users/me/friends/${friendshipId}/unblock`),

  searchUsers: (searchTerm: string): Promise<any> =>
    apiRequest('get', '/users/search', null, { search: searchTerm }),
};
