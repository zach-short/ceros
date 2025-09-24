import { Message } from './types';

interface ParentMessagePreviewProps {
  parentMessage: Message;
  isOwnReply: boolean;
  onClick?: () => void;
}

export function ParentMessagePreview({
  parentMessage,
  isOwnReply,
  onClick,
}: ParentMessagePreviewProps) {
  const truncateContent = (content: string, maxLength: number = 50) => {
    return content.length > maxLength
      ? `${content.slice(0, maxLength)}...`
      : content;
  };

  return (
    <div
      className={`text-xs p-2 rounded mb-2 cursor-pointer transition-opacity hover:opacity-80 ${
        isOwnReply
          ? 'border border-blue-300 bg-transparent text-blue-600 dark:text-blue-400'
          : 'border border-gray-400 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }`}
      onClick={onClick}
    >
      <p>{truncateContent(parentMessage.content)}</p>
    </div>
  );
}

