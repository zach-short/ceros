'use client';

import { User, Friendship } from '@/models';
import { UserAvatar } from './user-avatar';
import { UserName } from './user-name';
import { OnlineStatusIndicator } from './online-status-indicator';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  viewerUserId?: string;
  friendship?: Friendship;
  isOwnProfile?: boolean;
  showFullName?: boolean;
  showOnlineStatus?: boolean;
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
  showOnlineStatus = false,
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
        className,
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
      <div className='flex flex-col'>
        <div className='flex items-center gap-2'>
          <UserName
            user={user}
            viewerUserId={viewerUserId}
            friendship={friendship}
            isOwnProfile={isOwnProfile}
            showFullName={showFullName}
            className='font-medium text-sm truncate'
          />
          {showOnlineStatus && user.isOnline !== undefined && (
            <OnlineStatusIndicator isOnline={user.isOnline} size='sm' />
          )}
        </div>
        {showFullName && user.name && (
          <UserName
            user={user}
            viewerUserId={viewerUserId}
            friendship={friendship}
            isOwnProfile={isOwnProfile}
            showFullName={false}
            className='text-xs text-muted-foreground truncate'
          />
        )}
      </div>
      {children}
    </div>
  );
}
