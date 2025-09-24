'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Friendship } from '@/models';
import { getDisplayPicture, getDisplayName, UserPrivacyContext } from '@/lib/user-privacy';
import { EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User;
  viewerUserId?: string;
  friendship?: Friendship;
  isOwnProfile?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

export function UserAvatar({
  user,
  viewerUserId,
  friendship,
  isOwnProfile,
  size = 'md',
  className,
}: UserAvatarProps) {
  const context: UserPrivacyContext = {
    user,
    viewerUserId,
    friendship,
    isOwnProfile,
  };

  const displayPicture = getDisplayPicture(user, context);
  const displayName = getDisplayName(user, context);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {displayPicture ? (
        <>
          <AvatarImage src={displayPicture} alt={displayName} />
          <AvatarFallback>
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </>
      ) : (
        <AvatarFallback className="bg-muted">
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}