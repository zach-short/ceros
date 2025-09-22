'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/use-fetch';
import { usersApi, PublicProfileUser } from '@/lib/api/users';
import { ConversationSummary } from '@/lib/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConversationItemProps {
  conversation: ConversationSummary;
  searchQuery?: string;
}

export function ConversationItem({
  conversation,
  searchQuery,
}: ConversationItemProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const otherParticipantId = conversation.participants.find(
    (id) => id !== session?.user?.id,
  );

  const { data: otherUser } = useFetch<PublicProfileUser>(
    usersApi.getPublicProfile,
    {
      resourceParams: [otherParticipantId],
      dependencies: [otherParticipantId],
      enabled: !!otherParticipantId && conversation.type === 'dm',
    },
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleClick = () => {
    if (conversation.type === 'dm' && otherParticipantId) {
      router.push(`/chat/${otherParticipantId}`);
    }
  };

  const getDisplayName = () => {
    if (conversation.type === 'group') {
      return 'Group Chat';
    }

    if (otherUser) {
      return (
        otherUser.name ||
        `${otherUser.givenName || ''} ${otherUser.familyName || ''}`.trim() ||
        'Unknown User'
      );
    }

    return '';
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';

    const isOwn = conversation.lastMessage.senderId === session?.user?.id;
    const prefix = isOwn ? 'You: ' : '';
    const content = conversation.lastMessage.content;

    if (content.length > 50) {
      return prefix + content.substring(0, 50) + '...';
    }

    return prefix + content;
  };

  const matchesSearch = () => {
    if (!searchQuery?.trim()) return true;

    const query = searchQuery.toLowerCase();
    const displayName = getDisplayName().toLowerCase();
    const messageContent =
      conversation.lastMessage?.content?.toLowerCase() || '';

    return displayName.includes(query) || messageContent.includes(query);
  };

  if (!matchesSearch()) {
    return null;
  }

  return (
    <div onClick={handleClick} className='p-4 cursor-pointer transition-colors'>
      <div className='flex items-center space-x-3'>
        <Avatar>
          <AvatarImage src={otherUser?.picture as string | undefined} />
          <AvatarFallback>{getDisplayName().charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium 00 truncate'>
              {getDisplayName()}
            </h3>
            <span className='text-xs text-gray-500'>
              {conversation.lastMessage &&
                formatTime(conversation.lastMessageAt)}
            </span>
          </div>

          <p className='text-sm text-gray-500 truncate mt-1'>
            {getLastMessagePreview()}
          </p>
        </div>

        {conversation.unreadCount > 0 && (
          <div className='flex-shrink-0'>
            <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full'>
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
