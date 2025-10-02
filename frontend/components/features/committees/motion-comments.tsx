'use client';

import { useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MotionCommentsProps {
  motion: any;
}

export function MotionComments({ motion }: MotionCommentsProps) {
  const [comment, setComment] = useState('');

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    toast.success('Comment added');
    setComment('');
  };

  return (
    <div className='p-4 rounded-lg border'>
      <h2 className='font-medium mb-3 flex items-center gap-2'>
        <MessageSquare size={16} />
        Discussion ({motion.comments.length})
      </h2>

      <form onSubmit={handleComment} className='mb-4'>
        <div className='flex gap-2'>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Add a comment...'
            className='flex-1'
          />
          <Button type='submit' size='sm'>
            Post
          </Button>
        </div>
      </form>

      <div className='space-y-3'>
        {motion.comments.map((comment: any, index: number) => (
          <div key={index} className='p-3 rounded bg-accent/30'>
            <div className='flex justify-between items-start mb-1'>
              <p className='font-medium text-sm'>{comment.user}</p>
              <span className='text-xs opacity-60 flex items-center gap-1'>
                <Clock size={12} />
                {comment.time}
              </span>
            </div>
            <p className='text-sm'>{comment.text}</p>
          </div>
        ))}
        {motion.comments.length === 0 && (
          <p className='text-sm opacity-60 text-center py-4'>
            No comments yet. Be the first to discuss this motion.
          </p>
        )}
      </div>
    </div>
  );
}