import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ReplyState {
  messageId: string;
  content: string;
}

interface EditState {
  messageId: string;
  content: string;
}

interface MessageInputProps {
  isConnected?: boolean;
  onSendMessage: (content: string) => void;
  onProposeMotion?: () => void;
  showMotionButton?: boolean;
  placeholder?: string;
  variant?: 'default' | 'compact';
  replyState?: ReplyState;
  editState?: EditState;
  onReplyCancel?: () => void;
  onEditCancel?: () => void;
  onEditSave?: (messageId: string, content: string) => void;
}

const MAX_MESSAGE_LENGTH = 4000;

export function MessageInput({
  isConnected = true,
  onSendMessage,
  onProposeMotion,
  showMotionButton,
  placeholder = 'Type a message...',
  variant = 'default',
  replyState,
  editState,
  onReplyCancel,
  onEditCancel,
  onEditSave,
}: MessageInputProps) {
  const [newMessage, setNewMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editState) {
      setNewMessage(editState.content);
    } else if (!replyState) {
      setNewMessage('');
    }
  }, [editState, replyState]);

  useEffect(() => {
    if ((replyState || editState) && textareaRef.current) {
      textareaRef.current.focus();
      if (editState) {
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }
  }, [replyState, editState]);

  const isMessageTooLong = newMessage.length > MAX_MESSAGE_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !isConnected || isMessageTooLong) return;

    if (editState && onEditSave) {
      onEditSave(editState.messageId, newMessage.trim());
    } else {
      onSendMessage(newMessage.trim());
    }

    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      if (editState && onEditCancel) {
        onEditCancel();
      } else if (replyState && onReplyCancel) {
        onReplyCancel();
      }
    }
  };

  const getPlaceholderText = () => {
    if (editState) return 'Edit your message...';
    if (replyState) return 'Reply to message...';
    return placeholder;
  };

  const getButtonText = () => {
    if (editState) return 'Save';
    return 'Send';
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`${isCompact ? '' : 'border-t'} lg:relative fixed bottom-16 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto bg-background lg:bg-transparent z-40 lg:z-auto`}>
      {/* Reply/Edit indicator */}
      {(replyState || editState) && !isCompact && (
        <div className='px-4 py-2 bg-muted/50 border-b flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='text-sm font-medium'>
              {editState ? 'Editing' : 'Replying'}
            </div>
            {replyState && (
              <div className='text-sm text-muted-foreground'>
                {truncateMessage(replyState.content)}
              </div>
            )}
          </div>
          <button
            type='button'
            onClick={editState ? onEditCancel : onReplyCancel}
            className='p-1 hover:bg-muted rounded'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={isCompact ? '' : 'p-4'}>
        {!isCompact && isMessageTooLong && (
          <div className='mb-2 text-sm text-red-500'>
            Message too long ({newMessage.length}/{MAX_MESSAGE_LENGTH}{' '}
            characters)
          </div>
        )}

        <div className='flex space-x-2 items-end'>
          <div className='flex-1'>
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText()}
              className={`resize-none min-h-[40px] max-h-[200px] ${
                isMessageTooLong ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={!isConnected}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '40px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 200) + 'px';
              }}
            />
          </div>

          {!isCompact &&
            showMotionButton &&
            onProposeMotion &&
            !editState &&
            !replyState && (
              <button
                type='button'
                onClick={onProposeMotion}
                disabled={!isConnected}
                className='px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm h-fit'
              >
                Motion
              </button>
            )}

          <button
            type='submit'
            disabled={!newMessage.trim() || !isConnected || isMessageTooLong}
            className={`${
              isCompact ? 'px-3 py-2' : 'px-4 py-2'
            } bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed h-fit`}
          >
            {getButtonText()}
          </button>
        </div>

        {!isCompact &&
          newMessage.length > MAX_MESSAGE_LENGTH * 0.8 &&
          !isMessageTooLong && (
            <div className='mt-1 text-xs text-gray-500'>
              {MAX_MESSAGE_LENGTH - newMessage.length} characters remaining
            </div>
          )}
      </form>
    </div>
  );
}
