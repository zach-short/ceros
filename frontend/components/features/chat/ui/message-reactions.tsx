'use client';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onReactionClick: (emoji: string) => void;
  className?: string;
}

export function MessageReactions({ reactions, onReactionClick, className = '' }: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${className}`}>
      {reactions.map(({ emoji, count, userReacted }) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onReactionClick(emoji);
          }}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
            userReacted
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span>{emoji}</span>
          <span className="font-medium">{count}</span>
        </button>
      ))}
    </div>
  );
}