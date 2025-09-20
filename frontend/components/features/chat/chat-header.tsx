import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface ChatHeaderProps {
  recipientName: string;
  recipientId: string;
  recipientPicture?: string;
  isConnected: boolean;
  isLoading?: boolean;
}

export function ChatHeader({
  recipientName,
  recipientId,
  recipientPicture,
  isConnected,
  isLoading,
}: ChatHeaderProps) {
  return (
    <Link
      href={`/profile/${recipientId}`}
      className='hover:pointer p-4 border-b flex flex-row items-center gap-x-2'
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
  );
}
