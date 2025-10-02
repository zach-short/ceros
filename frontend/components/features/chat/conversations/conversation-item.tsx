'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ConversationSummary } from '@/lib/api/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Archive,
  Pin,
  Bell,
  BellOff,
  Trash2,
  MailOpen,
  PinOff,
} from 'lucide-react';

interface ConversationItemProps {
  conversation: ConversationSummary;
  searchQuery?: string;
  onArchive?: (roomId: string) => void;
  onPin?: (roomId: string) => void;
  onMute?: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  onMarkUnread?: (roomId: string) => void;
}

export function ConversationItem({
  conversation,
  searchQuery,
  onArchive,
  onPin,
  onMute,
  onDelete,
  onMarkUnread,
}: ConversationItemProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const otherUser = conversation.otherUser;

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
    if (conversation.type === 'dm' && otherUser) {
      router.push(`/chat/${otherUser.id}`);
    }
  };

  const getDisplayName = () => {
    if (conversation.type === 'committee') {
      return conversation.groupName || 'Committee Chat';
    }

    if (conversation.type === 'group') {
      return conversation.groupName || 'Group Chat';
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
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={handleClick}
          className='p-4 cursor-pointer transition-colors hover:bg-accent'
        >
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              <Avatar className={`h-12 w-12`}>
                <AvatarImage
                  src={
                    conversation.type === 'dm'
                      ? otherUser?.picture
                      : conversation.groupImage
                  }
                />
                <AvatarFallback>{getDisplayName().charAt(0)}</AvatarFallback>
              </Avatar>
              {conversation.isPinned && (
                <div className='absolute -top-1 -right-1 bg-primary rounded-full p-1'>
                  <Pin className='h-3 w-3 text-primary-foreground' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-sm font-medium truncate'>
                    {getDisplayName()}
                  </h3>
                  {conversation.isMuted && (
                    <BellOff className='h-3 w-3 text-muted-foreground' />
                  )}
                </div>
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
                  {conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        {onMarkUnread && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMarkUnread(conversation.roomId);
            }}
          >
            <MailOpen className='w-4 h-4 mr-2' />
            Mark as Unread
          </ContextMenuItem>
        )}
        {onPin && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onPin(conversation.roomId);
            }}
          >
            {conversation.isPinned ? (
              <>
                <PinOff className='w-4 h-4 mr-2' />
                Unpin
              </>
            ) : (
              <>
                <Pin className='w-4 h-4 mr-2' />
                Pin
              </>
            )}
          </ContextMenuItem>
        )}
        {onMute && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMute(conversation.roomId);
            }}
          >
            {conversation.isMuted ? (
              <>
                <Bell className='w-4 h-4 mr-2' />
                Unmute
              </>
            ) : (
              <>
                <BellOff className='w-4 h-4 mr-2' />
                Mute
              </>
            )}
          </ContextMenuItem>
        )}
        {onArchive && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onArchive(conversation.roomId);
            }}
          >
            <Archive className='w-4 h-4 mr-2' />
            Archive
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation.roomId);
            }}
            className='text-red-600'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
