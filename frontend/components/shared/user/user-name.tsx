'use client';

import { User, Friendship } from '@/models';
import { getDisplayName, UserPrivacyContext } from '@/lib/user-privacy';
import { cn } from '@/lib/utils';

interface UserNameProps {
  user: User;
  viewerUserId?: string;
  friendship?: Friendship;
  isOwnProfile?: boolean;
  showFullName?: boolean;
  className?: string;
  fallback?: string;
}

export function UserName({
  user,
  viewerUserId,
  friendship,
  isOwnProfile,
  showFullName = true,
  className,
  fallback = 'Unknown User',
}: UserNameProps) {
  const context: UserPrivacyContext = {
    user,
    viewerUserId,
    friendship,
    isOwnProfile,
  };

  const displayName = showFullName ? getDisplayName(user, context) : (user.name || fallback);

  return <span className={cn(className)}>{displayName}</span>;
}