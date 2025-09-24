export interface User {
  id: string;
  name?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  bio?: string;
  phoneNumber?: string;
  address?: Address;
  settings?: UserSettings;
  isCurrentUser?: boolean;
  friendshipStatus?: FriendshipStatus | null;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
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
  theme: string;
  autoAcceptFriendInvitations: boolean;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
}

export interface FriendshipStatus {
  status: 'pending' | 'accepted' | 'blocked';
  isPendingFromMe: boolean;
  isPendingToMe: boolean;
  friendshipId: string;
}

export type UserRole = 'admin' | 'member' | 'user' | 'observer';