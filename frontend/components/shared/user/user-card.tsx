'use client';

import { User, Friendship } from '@/models';
import { UserAvatar } from './user-avatar';
import { UserName } from './user-name';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  viewerUserId?: string;
  friendship?: Friendship;
  isOwnProfile?: boolean;
  showFullName?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function UserCard({
  user,
  viewerUserId,
  friendship,
  isOwnProfile,
  showFullName = true,
  avatarSize = 'md',
  className,
  children,
  onClick,
}: UserCardProps) {

  return (
    <div
      className={cn(
        'flex items-center space-x-3',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <UserAvatar
        user={user}
        viewerUserId={viewerUserId}
        friendship={friendship}
        isOwnProfile={isOwnProfile}
        size={avatarSize}
      />
      <div className="flex-1 min-w-0">
        <UserName
          user={user}
          viewerUserId={viewerUserId}
          friendship={friendship}
          isOwnProfile={isOwnProfile}
          showFullName={showFullName}
          className="font-medium text-sm truncate"
        />
        {showFullName && user.name && (
          <UserName
            user={user}
            viewerUserId={viewerUserId}
            friendship={friendship}
            isOwnProfile={isOwnProfile}
            showFullName={false}
            className="text-xs text-muted-foreground truncate"
          />
        )}
      </div>
      {children}
    </div>
  );
}