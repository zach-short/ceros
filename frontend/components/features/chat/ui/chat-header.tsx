import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { OnlineStatusIndicator } from '@/components/shared/user/online-status-indicator';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  recipientName: string;
  recipientId: string;
  recipientPicture?: string;
  isConnected: boolean;
  isLoading?: boolean;
  onToggleMotions?: () => void;
  onOpenSearch?: () => void;
  chatType?: 'dm' | 'committee';
  isOnline?: boolean;
}

export function ChatHeader({
  recipientName,
  recipientId,
  recipientPicture,
  isConnected,
  isLoading,
  onToggleMotions,
  onOpenSearch,
  chatType = 'dm',
  isOnline,
}: ChatHeaderProps) {
  const isCommittee = chatType === 'committee';
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
            {!isCommittee && isOnline !== undefined && (
              <OnlineStatusIndicator isOnline={isOnline} size='sm' showText />
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
      <div className='flex gap-2'>
        {onOpenSearch && (
          <Button
            variant='ghost'
            size='icon'
            onClick={onOpenSearch}
            className='h-9 w-9'
          >
            <Search className='h-4 w-4' />
          </Button>
        )}
        {isCommittee && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
