import { useState } from 'react';
import { Message } from './types';
import { ParentMessagePreview } from './parent-message-preview';
import { MessageContextMenu } from './message-context-menu';
import { MessageReactions } from './message-reactions';
import { MessageEditForm } from './message-edit-form';
import { MessageEditIndicator } from './message-edit-indicator';

type ReplyDisplayType =
  | 'direct-own'
  | 'distant-own'
  | 'direct-other'
  | 'distant-other';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (parentMessageId: string, content: string) => void;
  onOpenThread?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  isInThread?: boolean;
  replyDisplayType?: ReplyDisplayType | null;
  parentMessage?: Message;
  onScrollToParent?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  onReply,
  onOpenThread,
  onReaction,
  onEdit,
  isInThread = false,
  replyDisplayType = null,
  parentMessage,
  onScrollToParent,
}: MessageBubbleProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply) return;

    onReply(message.id, replyContent.trim());
    setReplyContent('');
    setShowReplyForm(false);
  };

  const handleContextReply = () => {
    setShowReplyForm(true);
  };

  const handleContextEdit = () => {
    setIsEditing(true);
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

  const handleReaction = (messageId: string, emoji: string) => {
    if (onReaction) {
      onReaction(messageId, emoji);
    }
  };

  const isReply = message.type === 'reply';
  const hasReplies = message.threadCount && message.threadCount > 0;
  const shouldShowParentPreview =
    replyDisplayType === 'distant-own' || replyDisplayType === 'distant-other';

  const renderReplyConnection = () => {
    if (!isReply || isInThread || !replyDisplayType) return null;

    const isDirectReply =
      replyDisplayType === 'direct-own' || replyDisplayType === 'direct-other';
    const isOwnReply =
      replyDisplayType === 'direct-own' || replyDisplayType === 'distant-own';

    if (isDirectReply) {
      return (
        <div
          className={`absolute w-0.5 bg-gray-400 ${
            isOwnReply ? 'right-4 -top-6 h-6' : 'left-4 -top-6 h-6'
          }`}
        />
      );
    } else {
      if (isOwnReply) {
        return (
          <div className='absolute right-4 -top-6'>
            <div className='w-0.5 h-6 bg-gray-400' />
            <div className='h-0.5 bg-gray-400 w-8 -mt-0.5 -ml-8' />
          </div>
        );
      } else {
        return (
          <div className='absolute -left-12 -top-6'>
            <div className='h-0.5 bg-gray-400 w-12' />
            <div className='w-0.5 bg-gray-400 h-6 ml-12' />
          </div>
        );
      }
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`${isReply && !isInThread ? 'ml-4' : ''} relative`}
    >
      {shouldShowParentPreview && parentMessage && (
        <div
          className={`mb-3 ${
            replyDisplayType === 'distant-own'
              ? 'flex justify-end '
              : 'flex justify-start '
          }`}
        >
          <div className='max-w-xs'>
            <ParentMessagePreview
              parentMessage={parentMessage}
              isOwnReply={replyDisplayType === 'distant-own'}
              onClick={() => onScrollToParent?.(parentMessage.id)}
            />
          </div>
        </div>
      )}

      {/* {renderReplyConnection()} */}

      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <MessageContextMenu
          message={message}
          isOwn={isOwn}
          onReply={handleContextReply}
          onEdit={isOwn ? handleContextEdit : undefined}
          onReaction={handleReaction}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg cursor-pointer select-none ${
              isReply
                ? isOwn
                  ? 'bg-blue-400 text-white'
                  : 'bg-gray-300 text-gray-900'
                : isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
            }`}
          >
            {isEditing ? (
              <MessageEditForm
                initialContent={message.content}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
                className='bg-transparent'
              />
            ) : (
              <>
                <p className='break-words whitespace-pre-wrap'>
                  {message.content}
                </p>

                <div className='flex items-center justify-between mt-1'>
                  <div className='flex-1'>
                    {message.reactions && message.reactions.length > 0 && (
                      <MessageReactions
                        reactions={message.reactions}
                        onReactionClick={(emoji) =>
                          handleReaction(message.id, emoji)
                        }
                        className='mt-1'
                      />
                    )}
                  </div>

                  {message.isEdited &&
                    message.originalContent &&
                    message.editedAt && (
                      <MessageEditIndicator
                        originalContent={message.originalContent}
                        editedAt={message.editedAt}
                        className='ml-2'
                      />
                    )}
                </div>
              </>
            )}
          </div>
        </MessageContextMenu>
      </div>

      {!isReply && !isInThread && hasReplies && (
        <div
          className={`mt-1 ${isOwn ? 'flex justify-end mr-4' : 'flex justify-start ml-4'}`}
        >
          <button
            onClick={() => onOpenThread?.(message.id)}
            className='text-xs text-blue-500 hover:text-blue-700 flex items-start gap-1'
          >
            <span>
              {message.threadCount}{' '}
              {message.threadCount === 1 ? 'Reply' : 'Replies'}
            </span>
          </button>
        </div>
      )}

      {showReplyForm && (
        <div className={`mt-2 ${isOwn ? 'mr-0' : 'ml-0'}`}>
          <form onSubmit={handleReplySubmit} className='flex gap-2'>
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
              className='px-2 py-1 text-sm bg-blue-500 text-white rounded disabled:opacity-50'
            >
              Send
            </button>
            <button
              type='button'
              onClick={() => setShowReplyForm(false)}
              className='px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded'
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
