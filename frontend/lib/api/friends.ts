import { apiRequest } from '../api';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  requestedAt: string;
  respondedAt?: string;
}

export interface AddFriendRequest {
  addresseeId: string;
}

export interface BlockUserRequest {
  blockedUserId: string;
}

export interface GetFriendshipsResponse {
  friendships: Friendship[];
}

export interface GetPendingRequestsResponse {
  pendingRequests: Friendship[];
}

export interface GetSentRequestsResponse {
  sentRequests: Friendship[];
}

export interface GetFriendshipResponse {
  friendship: Friendship;
}

// Friends API routes following your clean pattern
export const friendsApi = {
  // GET requests
  getAll: (): Promise<any> =>
    apiRequest('get', '/users/me/friends'),

  getPending: (): Promise<any> =>
    apiRequest('get', '/users/me/friends/pending'),

  getSent: (): Promise<any> =>
    apiRequest('get', '/users/me/friends/sent'),

  getFriendship: (friendshipId: string): Promise<any> =>
    apiRequest('get', `/users/me/friends/${friendshipId}`),

  // POST requests
  requestFriend: (data: AddFriendRequest): Promise<any> =>
    apiRequest('post', '/users/me/friends/request', data),

  acceptFriend: (friendshipId: string): Promise<any> =>
    apiRequest('post', `/users/me/friends/${friendshipId}/accept`),

  rejectFriend: (friendshipId: string): Promise<any> =>
    apiRequest('post', `/users/me/friends/${friendshipId}/reject`),

  blockUser: (data: BlockUserRequest): Promise<any> =>
    apiRequest('post', '/users/me/friends/block', data),

  // DELETE requests
  removeFriend: (friendshipId: string): Promise<any> =>
    apiRequest('delete', `/users/me/friends/${friendshipId}`),

  unblockUser: (friendshipId: string): Promise<any> =>
    apiRequest('delete', `/users/me/friends/${friendshipId}/unblock`),
};