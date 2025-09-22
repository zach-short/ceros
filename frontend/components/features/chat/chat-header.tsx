import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface ChatHeaderProps {
  recipientName: string;
  recipientId: string;
  recipientPicture?: string;
  isConnected: boolean;
  isLoading?: boolean;
  onToggleMotions?: () => void;
}

export function ChatHeader({
  recipientName,
  recipientId,
  recipientPicture,
  isConnected,
  isLoading,
  onToggleMotions,
}: ChatHeaderProps) {
  const isCommittee = recipientId && recipientId.length === 24;
  const profileLink = isCommittee
    ? `/committees/${recipientId}`
    : `/profile/${recipientId}`;

  return (
    <div className='p-4 border-b flex flex-row items-center justify-between'>
      <Link
        href={profileLink}
        className='hover:pointer flex flex-row items-center gap-x-2'
      >
        <Avatar>
          <AvatarImage src={recipientPicture as string | undefined} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <div>
          <h2 className='font-semibold'>{recipientName}</h2>
          <div className='flex items-center gap-2 text-xs opacity-75'>
            {!isLoading && !isConnected && (
              <span className='text-red-500'>🔴 Disconnected</span>
            )}
            {isCommittee && (
              <>
                <span>30 members</span>
                <span>•</span>
                <span>1 Active Motion</span>
              </>
            )}
          </div>
        </div>
      </Link>
      {isCommittee && (
        <div className='flex gap-2'>
          <button
            onClick={() => {
              window.location.href = `/committees/${recipientId}/members`;
            }}
            className='px-3 py-1 text-sm rounded border hover:bg-accent'
          >
            Members
          </button>
          {onToggleMotions && (
            <button
              onClick={onToggleMotions}
              className='px-3 py-1 text-sm rounded border hover:bg-accent'
            >
              Motions
            </button>
          )}
        </div>
      )}
    </div>
  );
}
