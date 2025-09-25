'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Message } from './types';
import { MessageInput } from './message-input';
import { chatApi } from '@/lib/api/chat';
import { Button } from '@/components/ui/button';

interface ThreadViewProps {
  parentMessage: Message;
  onClose: () => void;
  onSendReply: (content: string) => void;
  currentUserId: string;
}

export function ThreadView({
  parentMessage,
  onClose,
  onSendReply,
  currentUserId,
}: ThreadViewProps) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await chatApi.getMessageReplies(parentMessage.id);
        if (response.success) {
          setReplies(response.data.replies || []);
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [parentMessage.id]);

  const handleSendReply = (content: string) => {
    onSendReply(content);
    const newReply: Message = {
      id: `temp-${Date.now()}`,
      type: 'reply',
      senderId: currentUserId,
      content,
      roomId: parentMessage.roomId,
      timestamp: new Date().toISOString(),
      parentMessageId: parentMessage.id,
    };
    setReplies((prev) => [...prev, newReply]);
  };

  const formatTime = (timestamp: string) => {
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
      return date.toLocaleDateString();
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl h-5/6 flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
              <span className='text-sm font-medium'>M</span>
            </div>
            <span className='font-medium'>Thread</span>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose} className='p-1'>
            <X size={20} />
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          <div className='pb-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='opacity-60'>
              <div className='flex justify-start'>
                <div className='max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'>
                  <p>{parentMessage.content}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    {formatTime(parentMessage.timestamp)}
                  </p>
                </div>
              </div>
              <div className='mt-1'>
                <span className='text-xs text-blue-500'>
                  {parentMessage.threadCount}{' '}
                  {parentMessage.threadCount === 1 ? 'Reply' : 'Replies'}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
          ) : replies.length > 0 ? (
            <div className='relative'>
              <div className='absolute left-6 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600'></div>

              <div className='space-y-3 relative'>
                {replies.map((reply) => (
                  <div key={reply.id} className='relative'>
                    <div className='absolute left-6 top-4 w-4 h-px bg-gray-300 dark:bg-gray-600'></div>
                    <div className='ml-10'>
                      <div
                        className={`flex ${reply.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            reply.senderId === currentUserId
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p>{reply.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              reply.senderId === currentUserId
                                ? 'text-blue-100'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {formatTime(reply.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
              No replies yet
            </div>
          )}
        </div>

        <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
          <MessageInput
            onSendMessage={handleSendReply}
            placeholder='Reply...'
            variant='compact'
          />
        </div>
      </div>
    </div>
  );
}

