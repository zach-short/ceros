'use client';

import { ReactNode, useState } from 'react';
import { Message } from '@/models';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Reply, Edit, Heart, Copy, Trash2, ArrowLeft } from 'lucide-react';
import { MORE_REACTIONS, QUICK_REACTIONS } from './emojis';

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  children: ReactNode;
  onReply?: (messageId: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  chatType?: 'dm' | 'committee';
}

export function MessageContextMenu({
  message,
  isOwn,
  children,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageContextMenuProps) {
  const [showMobileReactions, setShowMobileReactions] = useState(false);

  const canEdit = () => {
    if (!isOwn || !onEdit) return false;
    if (message.originalContent) return false;

    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

    return diffMinutes <= 15;
  };

  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowMobileReactions(false);
  };

  const handleReply = () => {
    onReply?.(message.id, message.content);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message.id, message.content);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {});
  };

  const handleMoreReactions = () => {
    setShowMobileReactions(true);
  };

  const handleBackToMain = () => {
    setShowMobileReactions(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        asChild
        className='select-none touch-manipulation'
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className={showMobileReactions ? 'w-[90vw] max-w-[320px] md:min-w-[200px]' : 'min-w-[200px]'}>
        {showMobileReactions ? (
          <div className='block md:hidden'>
            <div className='flex items-center justify-between p-2 border-b'>
              <button
                onClick={handleBackToMain}
                className='flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <ArrowLeft className='w-4 h-4 mr-1' />
                Back
              </button>
              <span className='text-sm font-medium'>More Reactions</span>
              <div className='w-12'></div>
            </div>
            <div className='grid grid-cols-6 sm:grid-cols-8 gap-1 p-3 overflow-y-auto max-h-[60vh]'>
              {MORE_REACTIONS.map((emoji) => (
                <ContextMenuItem
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className='w-10 h-10 rounded hover:bg-accent flex items-center justify-center text-xl transition-colors p-0'
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </ContextMenuItem>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className='flex gap-1 p-2'>
              {QUICK_REACTIONS.map((emoji) => (
                <ContextMenuItem
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className='w-8 h-8 rounded hover:bg-accent flex items-center text-lg transition-colors p-0 justify-center'
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </ContextMenuItem>
              ))}
            </div>

            <ContextMenuSeparator />

            {onReply && (
              <ContextMenuItem onClick={handleReply}>
                <Reply className='w-4 h-4 mr-2' />
                Reply
              </ContextMenuItem>
            )}

            {canEdit() && (
              <ContextMenuItem onClick={handleEdit}>
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={handleCopy}>
              <Copy className='w-4 h-4 mr-2' />
              Copy Text
            </ContextMenuItem>
            {isOwn && onDelete && (
              <ContextMenuItem onClick={handleDelete} className='text-red-600'>
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </ContextMenuItem>
            )}

            <div className='md:hidden'>
              <ContextMenuItem onClick={handleMoreReactions}>
                <Heart className='w-4 h-4 mr-2' />
                More Reactions
              </ContextMenuItem>
            </div>

            <div className='hidden md:block'>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Heart className='w-4 h-4 mr-2' />
                  More Reactions
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className='w-[90vw] max-w-[280px] max-h-[50vh] md:max-h-[400px]'>
                  <div className='grid grid-cols-6 sm:grid-cols-8 gap-1 p-2 overflow-y-auto max-h-[45vh] md:max-h-[360px]'>
                    {MORE_REACTIONS.map((emoji) => (
                      <ContextMenuItem
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className='w-8 h-8 rounded hover:bg-accent flex items-center justify-center text-lg transition-colors p-0'
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </ContextMenuItem>
                    ))}
                  </div>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </div>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
