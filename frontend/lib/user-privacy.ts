import { User, Friendship, PrivacySettings } from '@/models';

export interface UserPrivacyContext {
  user: User;
  viewerUserId?: string;
  friendship?: Friendship;
  isOwnProfile?: boolean;
}

export function canViewField(
  field: keyof PrivacySettings,
  context: UserPrivacyContext
): boolean {
  const { user, viewerUserId, friendship, isOwnProfile } = context;

  if (isOwnProfile || user.id === viewerUserId) return true;

  if (!user.settings?.privacy) return true;

  const privacySetting = user.settings.privacy[field];

  if (privacySetting) return true;

  const isFriend = friendship?.status === 'accepted';

  return Boolean(isFriend);
}

export function getDisplayName(user: User, context: UserPrivacyContext): string {
  const canSeeGiven = canViewField('showGivenName', context);
  const canSeeFamily = canViewField('showFamilyName', context);

  if (canSeeGiven && canSeeFamily && user.givenName && user.familyName) {
    return `${user.givenName} ${user.familyName}`;
  }

  if (canSeeGiven && user.givenName) return user.givenName;
  if (canSeeFamily && user.familyName) return user.familyName;

  return user.name || 'Unknown User';
}

export function getDisplayPicture(user: User, context: UserPrivacyContext): string | null {
  const canSeePicture = canViewField('showPicture', context);
  return canSeePicture ? (user.picture || null) : null;
}

export function getDisplayEmail(user: User, context: UserPrivacyContext): string | null {
  const canSeeEmail = canViewField('showEmail', context);
  return canSeeEmail ? (user.email || null) : null;
}

export function getDisplayPhone(user: User, context: UserPrivacyContext): string | null {
  const canSeePhone = canViewField('showPhoneNumber', context);
  return canSeePhone ? (user.phoneNumber || null) : null;
}

export function getDisplayBio(user: User, context: UserPrivacyContext): string | null {
  const canSeeBio = canViewField('showBio', context);
  return canSeeBio ? (user.bio || null) : null;
}

export function getDisplayAddress(user: User, context: UserPrivacyContext): User['address'] | null {
  const canSeeAddress = canViewField('showAddress', context);
  return canSeeAddress ? (user.address || null) : null;
}