'use client';

import { Message, User } from '@/models';
import { UserAvatar } from '@/components/shared/user/user-avatar';
import { MessageReactions } from './message-reactions';
import { MessageEditIndicator } from './message-edit-indicator';
import { ParentMessagePreview } from './parent-message-preview';
import { MessageContextMenu } from './message-context-menu';
import { getDisplayName, UserPrivacyContext } from '@/lib/user-privacy';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  users: User[];
  onReply?: (messageId: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  parentMessage?: Message;
  onScrollToParent?: (messageId: string) => void;
  chatType?: 'dm' | 'committee';
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const MessageHeader = ({
  sender,
  privacyContext,
  timestamp,
}: {
  sender: User | undefined;
  privacyContext: UserPrivacyContext;
  timestamp: string;
}) => {
  const getUserDisplayName = () => {
    if (!sender) return 'Unknown User';
    return getDisplayName(sender, privacyContext);
  };

  return (
    <div className='flex items-baseline gap-2'>
      <span className='font-semibold text-sm'>{getUserDisplayName()}</span>
      <span className='text-xs text-muted-foreground'>
        {formatTimestamp(timestamp)}
      </span>
    </div>
  );
};

const MessageContent = ({
  message,
  onReactionClick,
}: {
  message: Message;
  onReactionClick: (emoji: string) => void;
}) => {
  return (
    <>
      <p className='text-sm whitespace-pre-wrap break-words overflow-auto'>
        {message.content}
      </p>

      <div className='flex flex-row items-center gap-2 mt-1'>
        {message.isEdited && message.originalContent && message.editedAt && (
          <MessageEditIndicator
            originalContent={message.originalContent}
            editedAt={message.editedAt}
            className=''
          />
        )}

        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            onReactionClick={onReactionClick}
          />
        )}
      </div>
    </>
  );
};

export function MessageBubble({
  message,
  currentUserId,
  users,
  onReply,
  onEdit,
  onReaction,
  onDelete,
  parentMessage,
  onScrollToParent,
  chatType = 'dm',
  showAvatar = true,
  isFirstInGroup = true,
}: MessageBubbleProps) {
  const sender = users.find((u) => u.id === message.senderId);
  const isOwn = message.senderId === currentUserId;
  const isReply = message.type === 'reply';

  const privacyContext: UserPrivacyContext = {
    user: sender || ({ id: message.senderId } as User),
    viewerUserId: currentUserId,
    isOwnProfile: isOwn,
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
  };

  const handleContextMenuReaction = (messageId: string, emoji: string) => {
    onReaction?.(messageId, emoji);
  };

  return (
    <div
      id={`message-${message.id}`}
      className='group hover:bg-accent/50 py-[.5]'
    >
      {isReply && parentMessage && isFirstInGroup && (
        <div className='mb-2 ml-12'>
          <ParentMessagePreview
            parentMessage={parentMessage}
            isOwnReply={false}
            onClick={() => onScrollToParent?.(parentMessage.id)}
            users={users}
            currentUserId={currentUserId}
          />
        </div>
      )}

      <div className='flex space-x-2'>
        <div className=''>
          {showAvatar && isFirstInGroup && sender ? (
            <UserAvatar
              user={sender}
              viewerUserId={currentUserId}
              isOwnProfile={isOwn}
              size='md'
            />
          ) : (
            <div className='w-10 h-2' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <MessageContextMenu
            message={message}
            isOwn={isOwn}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReaction={handleContextMenuReaction}
            chatType={chatType}
          >
            <div>
              {isFirstInGroup && (
                <MessageHeader
                  sender={sender}
                  privacyContext={privacyContext}
                  timestamp={message.timestamp}
                />
              )}

              <div className='flex flex-col'>
                <MessageContent
                  message={message}
                  onReactionClick={handleReaction}
                />
              </div>
            </div>
          </MessageContextMenu>
        </div>
      </div>
    </div>
  );
}
