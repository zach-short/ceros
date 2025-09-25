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
  onReply?: (parentMessageId: string, content: string) => void;
  onOpenThread?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
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
  previousMessage?: Message,
): boolean => {
  if (!previousMessage) return false;

  if (currentMessage.senderId !== previousMessage.senderId) return false;

  if (currentMessage.type === 'reply' || previousMessage.type === 'reply')
    return false;

  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const diffMinutes =
    (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);

  return diffMinutes <= 5;
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
      onOpenThread: onReaction,
      onEdit,
      onScrollToMessage,
      chatType = 'dm',
    },
    messagesEndRef,
  ) => {
    return (
      <div className='flex-1 overflow-y-auto flex flex-col min-h-0'>
        {isLoading ? (
          <div className='flex items-center justify-center flex-1'>
            <DefaultLoader />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center flex-1 text-center opacity-60'>
            Start your conversation with {recipientName}
          </div>
        ) : (
          <div className='flex flex-col flex-1'>
            {messages.map((message, index) => {
              const isReply = message.type === 'reply';
              const previousMessage = messages[index - 1];
              const showTimeHeader = shouldShowTimeHeader(
                message,
                previousMessage,
              );
              const isGrouped = shouldGroupMessages(message, previousMessage);
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
