'use client';

import { ReactNode } from 'react';
import { Message } from './types';
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
import {
  Reply,
  Edit,
  Heart,
} from 'lucide-react';

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  children: ReactNode;
  onReply: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😢', '😮', '😡'];
const MORE_REACTIONS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉',
  '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨',
  '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁',
];

export function MessageContextMenu({
  message,
  isOwn,
  children,
  onReply,
  onEdit,
  onReaction,
}: MessageContextMenuProps) {
  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
  };

  const handleReply = () => {
    onReply(message.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message.id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-[200px]">
        {/* Quick Emoji Reactions */}
        <div className="flex gap-1 p-2">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="w-8 h-8 rounded hover:bg-accent flex items-center justify-center text-lg transition-colors"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleReply}>
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </ContextMenuItem>

        {isOwn && onEdit && (
          <ContextMenuItem onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </ContextMenuItem>
        )}

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Heart className="w-4 h-4 mr-2" />
            More Reactions
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[240px]">
            <div className="grid grid-cols-8 gap-1 p-2">
              {MORE_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 rounded hover:bg-accent flex items-center justify-center text-lg transition-colors"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}