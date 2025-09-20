import { forwardRef } from 'react';
import { MessageBubble } from './message-bubble';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  recipientName: string;
  isLoading?: boolean;
}

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, currentUserId, recipientName, isLoading }, messagesEndRef) => {
    return (
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <DefaultLoader />
          </div>
        ) : messages.length === 0 ? (
          <div className='text-center text-gray-500 py-8'>
            Start your conversation with {recipientName}
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <MessageBubble key={message.id} message={message} isOwn={isOwn} />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  },
);

MessagesList.displayName = 'MessagesList';

