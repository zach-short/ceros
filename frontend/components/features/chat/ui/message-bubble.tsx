'use client';

import { useState } from 'react';
import { Message, User } from '@/models';
import { UserAvatar } from '@/components/shared/user/user-avatar';
import { MessageReactions } from './message-reactions';
import { MessageEditForm } from './message-edit-form';
import { MessageEditIndicator } from './message-edit-indicator';
import { ParentMessagePreview } from './parent-message-preview';
import { useMediaSize } from '@/hooks/use-media-size';
import { getDisplayName, UserPrivacyContext } from '@/lib/user-privacy';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Reply, Edit, Trash2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  users: User[];
  onReply?: (parentMessageId: string, content: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  parentMessage?: Message;
  onScrollToParent?: (messageId: string) => void;
  chatType?: 'dm' | 'committee';
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😢', '😮', '😡'];

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const MessageActions = ({
  chatType,
  isOwn,
  onActionClick,
}: {
  chatType: 'dm' | 'committee';
  isOwn: boolean;
  onActionClick: (action: string) => void;
}) => (
  <div className='space-y-2 p-4'>
    <div>
      <h4 className='text-sm font-medium mb-2'>Quick Reactions</h4>
      <div className='flex gap-2'>
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onActionClick(`react:${emoji}`);
            }}
            className='w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center text-lg transition-colors'
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>

    <div className='space-y-1'>
      <button
        onClick={() => onActionClick('reply')}
        className='w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left'
      >
        <Reply className='w-4 h-4' />
        Reply
      </button>

      {isOwn && (
        <>
          <button
            onClick={() => onActionClick('edit')}
            className='w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left'
          >
            <Edit className='w-4 h-4' />
            Edit
          </button>
          <button
            onClick={() => onActionClick('delete')}
            className='w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left text-red-600'
          >
            <Trash2 className='w-4 h-4' />
            Delete
          </button>
        </>
      )}

      <button
        onClick={() => onActionClick('copy')}
        className='w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left'
      >
        Copy Text
      </button>

      {chatType === 'dm' && (
        <button
          onClick={() => onActionClick('report')}
          className='w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left'
        >
          Report
        </button>
      )}
    </div>
  </div>
);

const MessageHeader = ({
  sender,
  privacyContext,
  timestamp,
}: {
  sender: User | undefined;
  privacyContext: UserPrivacyContext;
  timestamp: string;
}) => {
  const getUserDisplayName = () => {
    if (!sender) return 'Unknown User';
    return getDisplayName(sender, privacyContext);
  };

  return (
    <div className='flex items-baseline gap-2'>
      <span className='font-semibold text-sm'>{getUserDisplayName()}</span>
      <span className='text-xs text-muted-foreground'>
        {formatTimestamp(timestamp)}
      </span>
    </div>
  );
};

const MessageContent = ({
  message,
  isEditing,
  onEditSave,
  onEditCancel,
  onReactionClick,
}: {
  message: Message;
  isEditing: boolean;
  onEditSave: (newContent: string) => void;
  onEditCancel: () => void;
  onReactionClick: (emoji: string) => void;
}) => {
  if (isEditing) {
    return (
      <MessageEditForm
        initialContent={message.content}
        onSave={onEditSave}
        onCancel={onEditCancel}
      />
    );
  }

  return (
    <>
      <p className='text-sm whitespace-pre-wrap break-words'>
        {message.content}
      </p>

      {message.reactions && message.reactions.length > 0 && (
        <MessageReactions
          reactions={message.reactions}
          onReactionClick={onReactionClick}
        />
      )}

      {message.isEdited && message.originalContent && message.editedAt && (
        <MessageEditIndicator
          originalContent={message.originalContent}
          editedAt={message.editedAt}
          className='mt-1'
        />
      )}
    </>
  );
};

const ReplyForm = ({
  replyContent,
  setReplyContent,
  onSubmit,
  onCancel,
}: {
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) => (
  <div className='mt-2'>
    <form onSubmit={onSubmit} className='flex gap-2'>
      <input
        type='text'
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder='Reply to this message...'
        className='flex-1 px-2 py-1 text-sm border rounded'
        autoFocus
      />
      <button
        type='submit'
        disabled={!replyContent.trim()}
        className='px-3 py-1 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50'
      >
        Send
      </button>
      <button
        type='button'
        onClick={onCancel}
        className='px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded'
      >
        Cancel
      </button>
    </form>
  </div>
);

export function MessageBubble({
  message,
  currentUserId,
  users,
  onReply,
  onEdit,
  onReaction,
  onDelete,
  parentMessage,
  onScrollToParent,
  chatType = 'dm',
  showAvatar = true,
  isFirstInGroup = true,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isLargeScreen = useMediaSize(1024);

  const sender = users.find((u) => u.id === message.senderId);
  const isOwn = message.senderId === currentUserId;
  const isReply = message.type === 'reply';

  const privacyContext: UserPrivacyContext = {
    user: sender || ({ id: message.senderId } as User),
    viewerUserId: currentUserId,
    isOwnProfile: isOwn,
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply) return;

    onReply(message.id, replyContent.trim());
    setReplyContent('');
    setShowReplyForm(false);
  };

  const handleEditSave = (newContent: string) => {
    if (onEdit) {
      onEdit(message.id, newContent);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
  };

  const handleActionClick = (action: string) => {
    setIsSheetOpen(false);

    switch (action) {
      case 'reply':
        setShowReplyForm(true);
        break;
      case 'edit':
        if (isOwn) {
          setIsEditing(true);
        }
        break;
      case 'delete':
        if (isOwn) {
          if (onDelete) {
            onDelete(message.id);
          } else {
            toast('Delete functionality not implemented yet');
          }
        }
        break;
      default:
        if (action.startsWith('react:')) {
          const emoji = action.split(':')[1];
          handleReaction(emoji);
        } else {
          toast(`${action} functionality not implemented yet`);
        }
        break;
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className='group hover:bg-accent/50 py-[.5]'
    >
      {isReply && parentMessage && isFirstInGroup && (
        <div className='mb-2 ml-12'>
          <ParentMessagePreview
            parentMessage={parentMessage}
            isOwnReply={false}
            onClick={() => onScrollToParent?.(parentMessage.id)}
            users={users}
            currentUserId={currentUserId}
          />
        </div>
      )}

      <div className='flex space-x-2'>
        <div className=''>
          {showAvatar && isFirstInGroup && sender ? (
            <UserAvatar
              user={sender}
              viewerUserId={currentUserId}
              isOwnProfile={isOwn}
              size='md'
            />
          ) : (
            <div className='w-10 h-2' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <div>
                {isFirstInGroup && (
                  <MessageHeader
                    sender={sender}
                    privacyContext={privacyContext}
                    timestamp={message.timestamp}
                  />
                )}

                <div className='flex-1'>
                  <MessageContent
                    message={message}
                    isEditing={isEditing}
                    onEditSave={handleEditSave}
                    onEditCancel={handleEditCancel}
                    onReactionClick={handleReaction}
                  />
                </div>
              </div>
            </SheetTrigger>
            <SheetContent
              side={isLargeScreen ? 'right' : 'bottom'}
              className={isLargeScreen ? 'w-80' : 'h-auto'}
            >
              <SheetHeader>
                <SheetTitle>Message Actions</SheetTitle>
              </SheetHeader>
              <MessageActions
                chatType={chatType}
                isOwn={isOwn}
                onActionClick={handleActionClick}
              />
            </SheetContent>
          </Sheet>

          {showReplyForm && (
            <ReplyForm
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
