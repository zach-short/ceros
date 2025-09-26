import { forwardRef } from 'react';
import { MessageBubble } from './message-bubble';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { Message, User } from './types';

interface MessagesListProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  recipientName?: string;
  isLoading?: boolean;
  onReply?: (messageId: string, content: string) => void;
  onOpenThread?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  chatType?: 'dm' | 'committee';
}

const getTimeGroupHeader = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 24) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (diffDays < 2) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  } else {
    return messageDate.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
};

const shouldShowTimeHeader = (
  currentMessage: Message,
  previousMessage?: Message,
): boolean => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const diffHours =
    (currentTime.getTime() - previousTime.getTime()) / (1000 * 60 * 60);

  return diffHours >= 4;
};

const shouldGroupMessages = (
  currentMessage: Message,
  messages: Message[],
  currentIndex: number,
  previousMessage?: Message,
): boolean => {
  if (!previousMessage) return false;

  // Don't group if different senders
  if (currentMessage.senderId !== previousMessage.senderId) return false;

  // Don't group replies or with replies
  if (currentMessage.type === 'reply' || previousMessage.type === 'reply')
    return false;

  // Check if there's a time header between these messages
  const showTimeHeaderBetween = shouldShowTimeHeader(
    currentMessage,
    previousMessage,
  );
  if (showTimeHeaderBetween) return false;

  // Group consecutive messages from the same sender
  // Only break if there's been an interruption by another sender or significant time gap
  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const diffHours =
    (currentTime.getTime() - previousTime.getTime()) / (1000 * 60 * 60);

  // Don't group if more than 2 hours apart
  if (diffHours > 2) return false;

  // Check if there are any messages from other senders between the previous message
  // and this one (though this is unlikely in a chronological list)
  return true;
};

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  (
    {
      messages,
      users,
      currentUserId,
      recipientName,
      isLoading,
      onReply,
      onReaction,
      onEdit,
      onDelete,
      onScrollToMessage,
      chatType = 'dm',
    },
    messagesEndRef,
  ) => {
    return (
      <div className='flex-1 overflow-y-auto flex flex-col min-h-0 pb-0 lg:pb-0'>
        {isLoading ? (
          <div className='flex items-center justify-center flex-1'>
            <DefaultLoader />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center flex-1 text-center opacity-60'>
            Start your conversation with {recipientName}
          </div>
        ) : (
          <div className='flex flex-col flex-1 px-1 rounded-md pb-4 lg:pb-1'>
            {messages.map((message, index) => {
              const isReply = message.type === 'reply';
              const previousMessage = messages[index - 1];
              const showTimeHeader = shouldShowTimeHeader(
                message,
                previousMessage,
              );
              const isGrouped = shouldGroupMessages(
                message,
                messages,
                index,
                previousMessage,
              );
              const isFirstInGroup = !isGrouped;

              let parentMessage: Message | undefined;
              if (isReply && message.parentMessageId) {
                parentMessage = messages.find(
                  (m) => m.id === message.parentMessageId,
                );
              }

              return (
                <div
                  key={message.id}
                  className={isFirstInGroup && index > 0 ? 'mt-3' : ''}
                >
                  {showTimeHeader && (
                    <div className='text-center text-xs text-gray-500 my-4'>
                      {getTimeGroupHeader(message.timestamp)}
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    currentUserId={currentUserId}
                    users={users}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReaction={onReaction}
                    parentMessage={parentMessage}
                    onScrollToParent={onScrollToMessage}
                    chatType={chatType}
                    showAvatar={true}
                    isFirstInGroup={isFirstInGroup}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  },
);

MessagesList.displayName = 'MessagesList';
