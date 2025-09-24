import { Friendship, User } from '@/models';

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

export interface SearchUsersResponse {
  users: User[];
}