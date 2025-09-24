import { forwardRef } from 'react';
import { MessageBubble } from './message-bubble';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  recipientName?: string;
  isLoading?: boolean;
  onReply?: (parentMessageId: string, content: string) => void;
  onOpenThread?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

const getTimeGroupHeader = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 24) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 2) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  } else {
    return messageDate.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
};

const shouldShowTimeHeader = (currentMessage: Message, previousMessage?: Message): boolean => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const diffHours = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60 * 60);

  return diffHours >= 4;
};

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, currentUserId, recipientName, isLoading, onReply, onOpenThread, onReaction, onEdit, onScrollToMessage }, messagesEndRef) => {
    return (
      <div className='flex-1 overflow-y-auto p-4 flex flex-col min-h-0'>
        {isLoading ? (
          <div className='flex items-center justify-center flex-1'>
            <DefaultLoader />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center flex-1 text-center opacity-60'>
            Start your conversation with {recipientName}
          </div>
        ) : (
          <div className='flex flex-col space-y-3 flex-1'>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const isReply = message.type === 'reply';
              const previousMessage = messages[index - 1];
              const showTimeHeader = shouldShowTimeHeader(message, previousMessage);

              let replyDisplayType: 'direct-own' | 'distant-own' | 'direct-other' | 'distant-other' | null = null;
              let parentMessage: Message | undefined;

              if (isReply && message.parentMessageId) {
                const isDirectlyBelow = previousMessage?.id === message.parentMessageId;
                parentMessage = messages.find(m => m.id === message.parentMessageId);

                if (isOwn && isDirectlyBelow) {
                  replyDisplayType = 'direct-own';
                } else if (isOwn && !isDirectlyBelow) {
                  replyDisplayType = 'distant-own';
                } else if (!isOwn && isDirectlyBelow) {
                  replyDisplayType = 'direct-other';
                } else if (!isOwn && !isDirectlyBelow) {
                  replyDisplayType = 'distant-other';
                }
              }

              return (
                <div key={message.id}>
                  {showTimeHeader && (
                    <div className='text-center text-xs text-gray-500 my-4'>
                      {getTimeGroupHeader(message.timestamp)}
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    onReply={onReply}
                    onOpenThread={onOpenThread}
                    onReaction={onReaction}
                    onEdit={onEdit}
                    replyDisplayType={replyDisplayType}
                    parentMessage={parentMessage}
                    onScrollToParent={onScrollToMessage}
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

