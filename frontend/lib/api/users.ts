import { apiRequest } from '../api';

export interface Committee {
  id: string;
  name: string;
  type: string;
  role: string;
}

export interface FriendshipStatus {
  status: 'pending' | 'accepted' | 'blocked';
  isPendingFromMe: boolean;
  isPendingToMe: boolean;
  friendshipId: string;
}

export interface PrivacySettings {
  showEmail: boolean;
  showPhoneNumber: boolean;
  showAddress: boolean;
  showGivenName: boolean;
  showFamilyName: boolean;
  showBio: boolean;
  showPicture: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  committeeInvitations: boolean;
  motionNotifications: boolean;
  voteNotifications: boolean;
  friendRequestNotifications: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  autoAcceptFriendInvitations: boolean;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  bio?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  settings?: UserSettings;
}

export interface PublicProfileUser extends User {
  committees?: Committee[];
  friendshipStatus?: FriendshipStatus;
  mutualFriendsCount?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  bio?: string;
  picture?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface UpdateUserSettingsRequest {
  theme?: 'light' | 'dark' | 'system';
  autoAcceptFriendInvitations?: boolean;
  privacy?: Partial<PrivacySettings>;
  notifications?: Partial<NotificationSettings>;
}

export interface CheckUsernameResponse {
  available: boolean;
}

export const usersApi = {
  getMe: (): Promise<any> => apiRequest('get', '/users/me'),
  getPublicProfile: (userId: string): Promise<any> =>
    apiRequest('get', `/users/${userId}/profile`),

  updateProfile: (data: UpdateProfileRequest): Promise<any> =>
    apiRequest('patch', '/users/me', data),

  updateSettings: (data: UpdateUserSettingsRequest): Promise<any> =>
    apiRequest('patch', '/users/me/settings', data),

  checkUsername: (name: string): Promise<any> =>
    apiRequest('get', '/users/check-username', null, { name }),
};
