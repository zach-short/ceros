import { Message, User } from './types';
import { Reply } from 'lucide-react';
import { getDisplayName, UserPrivacyContext } from '@/lib/user-privacy';
import { UserAvatar } from '@/components/shared/user/user-avatar';

interface ParentMessagePreviewProps {
  parentMessage: Message;
  isOwnReply: boolean;
  onClick?: () => void;
  users?: User[];
  currentUserId?: string;
}

export function ParentMessagePreview({
  parentMessage,
  onClick,
  users = [],
  currentUserId,
}: ParentMessagePreviewProps) {
  const truncateContent = (content: string, maxLength: number = 35) => {
    return content.length > maxLength
      ? `${content.slice(0, maxLength)}...`
      : content;
  };

  const sender = users.find((u) => u.id === parentMessage.senderId);
  const isOwn = parentMessage.senderId === currentUserId;

  const privacyContext: UserPrivacyContext = {
    user: sender || ({ id: parentMessage.senderId } as User),
    viewerUserId: currentUserId,
    isOwnProfile: isOwn,
  };

  const getUserDisplayName = () => {
    if (!sender) return 'Unknown User';
    return getDisplayName(sender, privacyContext);
  };

  return (
    <div
      className='flex items-center gap-1 text-xs cursor-pointer transition-opacity hover:opacity-80 text-muted-foreground'
      onClick={onClick}
    >
      <Reply className='w-3 h-3 flex-shrink-0' />
      {sender ? (
        <UserAvatar
          user={sender}
          viewerUserId={currentUserId}
          isOwnProfile={isOwn}
          size='sm'
          className='w-4 h-4'
        />
      ) : (
        <div className='w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center'>
          <span className='text-xs text-gray-600'>?</span>
        </div>
      )}
      <span className='font-medium'>{getUserDisplayName()}</span>
      <span className='text-xs opacity-75'>
        {truncateContent(parentMessage.content)}
      </span>
    </div>
  );
}
