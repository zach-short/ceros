'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Motion } from '@/models/motion';
import { User, Message } from '@/models';
import { MessagesList } from '@/components/features/chat/ui/messages-list';

interface MotionCommentsProps {
  motion: Motion;
  users: User[];
  messages: Message[];
  currentUserId: string;
  committeeId: string;
}

export function MotionComments({
  motion,
  users,
  messages,
  currentUserId,
  committeeId,
}: MotionCommentsProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className='rounded-lg border'>
      <div className='flex items-center justify-between p-4 border-b'>
        <h2 className='font-medium flex items-center gap-2'>
          <MessageSquare size={16} />
          Discussion ({messages.length})
        </h2>
        <Link href={`/committees/${committeeId}`}>
          <Button variant='ghost' size='sm'>
            <ExternalLink size={14} className='mr-1' />
            Go to Chat
          </Button>
        </Link>
      </div>

      <div className='p-4'>
        <div className='max-h-[500px] overflow-y-auto'>
          {messages.length === 0 ? (
            <div className='text-center py-8'>
              <MessageSquare className='w-12 h-12 mx-auto mb-2 text-muted-foreground/50' />
              <p className='text-sm text-muted-foreground'>
                No discussion messages yet.
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Discussion from the committee chat will appear here.
              </p>
            </div>
          ) : (
            <MessagesList
              ref={messagesEndRef}
              messages={messages}
              users={users}
              currentUserId={currentUserId}
              recipientName={motion.title}
              isLoading={false}
              chatType='committee'
            />
          )}
        </div>
      </div>
    </div>
  );
}

