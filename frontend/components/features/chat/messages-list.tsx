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
}

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, currentUserId, recipientName, isLoading, onReply }, messagesEndRef) => {
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
            {messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  onReply={onReply}
                />
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

