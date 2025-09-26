'use client';

import { ReactNode } from 'react';
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
import { Reply, Edit, Heart, Copy, Trash2 } from 'lucide-react';

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  children: ReactNode;
  onReply: (messageId: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  chatType?: 'dm' | 'committee';
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😢', '😮', '😡'];
const MORE_REACTIONS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
];

export function MessageContextMenu({
  message,
  isOwn,
  children,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageContextMenuProps) {
  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
  };

  const handleReply = () => {
    onReply(message.id, message.content);
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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='min-w-[200px]'>
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

        <ContextMenuItem onClick={handleReply}>
          <Reply className='w-4 h-4 mr-2' />
          Reply
        </ContextMenuItem>

        {isOwn && onEdit && (
          <ContextMenuItem onClick={handleEdit}>
            <Edit className='w-4 h-4 mr-2' />
            Edit
          </ContextMenuItem>
        )}

        {isOwn && onDelete && (
          <ContextMenuItem onClick={handleDelete} className='text-red-600'>
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={handleCopy}>
          <Copy className='w-4 h-4 mr-2' />
          Copy Text
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Heart className='w-4 h-4 mr-2' />
            More Reactions
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-[240px]'>
            <div className='grid grid-cols-8 gap-1 p-2'>
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
      </ContextMenuContent>
    </ContextMenu>
  );
}
