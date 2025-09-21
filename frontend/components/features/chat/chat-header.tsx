import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface ChatHeaderProps {
  recipientName: string;
  recipientId: string;
  recipientPicture?: string;
  isConnected: boolean;
  isLoading?: boolean;
  onToggleMotions?: () => void;
  showMotionPanel?: boolean;
}

export function ChatHeader({
  recipientName,
  recipientId,
  recipientPicture,
  isConnected,
  isLoading,
  onToggleMotions,
  showMotionPanel,
}: ChatHeaderProps) {
  return (
    <div className='p-4 border-b flex flex-row items-center justify-between'>
      <Link
        href={`/profile/${recipientId}`}
        className='hover:pointer flex flex-row items-center gap-x-2'
      >
        <Avatar>
          <AvatarImage src={recipientPicture as string | undefined} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <div>
          <h2 className='font-semibold'>{recipientName}</h2>
          <p className='text-xs text-gray-500'>
            {!isLoading && !isConnected && '🔴 You are disconnected'}
          </p>
        </div>
      </Link>
      {onToggleMotions && (
        <button
          onClick={onToggleMotions}
          className={`px-3 py-1 text-sm rounded ${
            showMotionPanel
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showMotionPanel ? 'Hide Motions' : 'Show Motions'}
        </button>
      )}
    </div>
  );
}
