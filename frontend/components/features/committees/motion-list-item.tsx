'use client';

import { Clock, Users, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Motion {
  id: string;
  title: string;
  description: string;
  status: string;
  mover: string;
  seconder: string | null;
  votes: {
    aye: number;
    nay: number;
    abstain: number;
    total: number;
  };
  comments: number;
  createdAt: string;
}

interface MotionListItemProps {
  motion: Motion;
  committeeId: string;
  isPast?: boolean;
}

export function MotionListItem({ motion, committeeId, isPast = false }: MotionListItemProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'proposed':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'passed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open for Voting';
      case 'proposed':
        return 'Needs Second';
      default:
        return status;
    }
  };

  return (
    <div
      onClick={() => router.push(`/committees/${committeeId}/motion/${motion.id}`)}
      className={`p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors ${isPast ? 'opacity-75' : ''}`}
    >
      <div className='flex justify-between items-start mb-2'>
        <h3 className='font-medium'>{motion.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(motion.status)}`}>
          {getStatusText(motion.status)}
        </span>
      </div>
      <p className='text-sm opacity-75 mb-3 line-clamp-2'>{motion.description}</p>

      <div className='flex items-center gap-4 text-xs opacity-60'>
        <span>Moved by {motion.mover}</span>
        {motion.seconder && <span>• Seconded by {motion.seconder}</span>}
        <span className='flex items-center gap-1'>
          <Clock size={12} />
          {motion.createdAt}
        </span>
        {!isPast && (
          <span className='flex items-center gap-1'>
            <Users size={12} />
            {motion.votes.total}/30 voted
          </span>
        )}
      </div>

      {motion.status === 'open' && !isPast && (
        <div className='mt-3 flex items-center justify-between'>
          <div className='flex items-center gap-4 text-xs'>
            <span className='flex items-center gap-1'>
              <MessageSquare size={12} />
              {motion.comments} comments
            </span>
          </div>
          <div className='text-xs'>
            {Math.round((motion.votes.aye / motion.votes.total) * 100)}% in favor
          </div>
        </div>
      )}
    </div>
  );
}