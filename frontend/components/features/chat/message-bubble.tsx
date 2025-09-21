import { useState } from 'react';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (parentMessageId: string, content: string) => void;
}

export function MessageBubble({ message, isOwn, onReply }: MessageBubbleProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply) return;

    onReply(message.id, replyContent.trim());
    setReplyContent('');
    setShowReplyForm(false);
  };

  const isReply = message.type === 'reply';

  return (
    <div className={`${isReply ? 'ml-6' : ''}`}>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isReply
              ? isOwn
                ? 'bg-blue-400 text-white'
                : 'bg-gray-300 text-gray-900'
              : isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {isReply && (
            <p className={`text-xs mb-1 ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
              ↳ Reply
            </p>
          )}
          <p>{message.content}</p>
          <div className="flex justify-between items-center mt-1">
            <p
              className={`text-xs ${
                isOwn ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
            {!isReply && onReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className={`text-xs ml-2 hover:underline ${
                  isOwn ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {message.threadCount ? `${message.threadCount} replies` : 'Reply'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className={`mt-2 ${isOwn ? 'mr-0' : 'ml-0'}`}>
          <form onSubmit={handleReplySubmit} className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Reply to this message..."
              className="flex-1 px-2 py-1 text-sm border rounded"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}