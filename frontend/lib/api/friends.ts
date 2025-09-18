import { apiRequest } from '../api';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  requestedAt: string;
  respondedAt?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
  };
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

export interface FriendshipStatus {
  status: 'pending' | 'accepted' | 'blocked';
  isPendingFromMe: boolean;
  isPendingToMe: boolean;
  friendshipId: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  isCurrentUser?: boolean;
  friendshipStatus?: FriendshipStatus | null;
}

export interface SearchUsersResponse {
  users: User[];
}

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
