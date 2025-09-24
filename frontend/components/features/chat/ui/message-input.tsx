import { useState } from 'react';

interface MessageInputProps {
  isConnected?: boolean;
  onSendMessage: (content: string) => void;
  onProposeMotion?: () => void;
  showMotionButton?: boolean;
  placeholder?: string;
  variant?: 'default' | 'compact';
}

const MAX_MESSAGE_LENGTH = 4000;

export function MessageInput({
  isConnected = true,
  onSendMessage,
  onProposeMotion,
  showMotionButton,
  placeholder = 'Type a message...',
  variant = 'default',
}: MessageInputProps) {
  const [newMessage, setNewMessage] = useState('');

  const isMessageTooLong = newMessage.length > MAX_MESSAGE_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !isConnected || isMessageTooLong) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const isCompact = variant === 'compact';

  return (
    <form onSubmit={handleSubmit} className={isCompact ? '' : 'p-4 border-t'}>
      {!isCompact && isMessageTooLong && (
        <div className='mb-2 text-sm text-red-500'>
          Message too long ({newMessage.length}/{MAX_MESSAGE_LENGTH} characters)
        </div>
      )}
      <div className='flex space-x-2'>
        <input
          type='text'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 ${
            isCompact ? 'px-3 py-2' : 'px-3 py-2'
          } border rounded-lg focus:outline-none focus:ring-2 ${
            isMessageTooLong
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500'
          }`}
          disabled={!isConnected}
        />
        {!isCompact && showMotionButton && onProposeMotion && (
          <button
            type='button'
            onClick={onProposeMotion}
            disabled={!isConnected}
            className='px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            Motion
          </button>
        )}
        <button
          type='submit'
          disabled={!newMessage.trim() || !isConnected || isMessageTooLong}
          className={`${
            isCompact ? 'px-3 py-2' : 'px-4 py-2'
          } bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Send
        </button>
      </div>
      {!isCompact && newMessage.length > MAX_MESSAGE_LENGTH * 0.8 && !isMessageTooLong && (
        <div className='mt-1 text-xs text-gray-500'>
          {MAX_MESSAGE_LENGTH - newMessage.length} characters remaining
        </div>
      )}
    </form>
  );
}

