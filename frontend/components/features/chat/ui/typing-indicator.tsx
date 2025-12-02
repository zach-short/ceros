'use client';

interface TypingIndicatorProps {
  typingUsers: Array<{ userId: string; name: string }>;
  chatType?: 'dm' | 'committee';
}

export function TypingIndicator({
  typingUsers,
  chatType,
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const getMessage = () => {
    if (chatType === 'dm') {
      return 'typing...';
    }

    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className='px-4 py-2 text-sm text-gray-500 flex items-center gap-2'>
      <span className={`h-2`}>{getMessage()}</span>
      <div className='flex gap-1'>
        <span className='animate-bounce' style={{ animationDelay: '0ms' }}>
          •
        </span>
        <span className='animate-bounce' style={{ animationDelay: '150ms' }}>
          •
        </span>
        <span className='animate-bounce' style={{ animationDelay: '300ms' }}>
          •
        </span>
      </div>
    </div>
  );
}

