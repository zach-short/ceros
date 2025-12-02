'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Motion } from '@/models/motion';
import { User } from '@/models';
import { getUserDisplayName } from '@/lib/user-utils';

interface MotionDetailsHeaderProps {
  motion: Motion;
  committeeId: string;
  mover?: User;
  seconder?: User;
}

export function MotionDetailsHeader({
  motion,
  committeeId,
  mover,
  seconder,
}: MotionDetailsHeaderProps) {
  const router = useRouter();

  return (
    <header className='p-4 border-b flex items-center gap-3'>
      <button
        onClick={() => router.push(`/committees/${committeeId}`)}
        className='p-2 hover:bg-accent rounded-full'
      >
        <ArrowLeft size={20} />
      </button>
      <div className='flex-1'>
        <h1 className='font-semibold'>{motion.title}</h1>
        <div className='flex items-center gap-2 text-xs opacity-75'>
          <span
            className={`px-2 py-1 rounded ${
              motion.status === 'open'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : motion.status === 'proposed'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  : 'bg-gray-100 dark:bg-gray-900'
            }`}
          >
            {motion.status === 'open'
              ? 'Open for Voting'
              : motion.status === 'proposed'
                ? 'Needs Second'
                : motion.status}
          </span>
          <span>•</span>
          <span>Moved by {mover ? getUserDisplayName(mover) : `User ${motion.mover_id.slice(0, 8)}`}</span>
          {seconder && (
            <>
              <span>•</span>
              <span>Seconded by {getUserDisplayName(seconder)}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

