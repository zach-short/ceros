'use client';

import { Motion } from '@/models/motion';
import { User } from '@/models';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  CheckCheck,
} from 'lucide-react';
import Image from 'next/image';

interface MotionCardCompactProps {
  motion: Motion;
  mover: User;
  seconder?: User;
  onClick: () => void;
}

export function MotionCardCompact({
  motion,
  mover,
  seconder,
  onClick,
}: MotionCardCompactProps) {
  const ayeCount = motion.votes?.filter((v) => v.result === 'aye').length || 0;
  const nayCount = motion.votes?.filter((v) => v.result === 'nay').length || 0;
  const abstainCount =
    motion.votes?.filter((v) => v.result === 'abstain').length || 0;
  const totalVotes = ayeCount + nayCount + abstainCount;

  const ayePercentage = totalVotes > 0 ? (ayeCount / totalVotes) * 100 : 0;
  const nayPercentage = totalVotes > 0 ? (nayCount / totalVotes) * 100 : 0;
  const abstainPercentage =
    totalVotes > 0 ? (abstainCount / totalVotes) * 100 : 0;

  const motionAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(motion.id)}`;

  const getStatusBadge = () => {
    switch (motion.status) {
      case 'proposed':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'>
            <Clock size={12} />
            Awaiting Second
          </span>
        );
      case 'seconded':
      case 'open':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
            <Clock size={12} />
            Open for Voting
          </span>
        );
      case 'passed':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
            <CheckCheck size={12} />
            Passed
          </span>
        );
      case 'failed':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'>
            <XCircle size={12} />
            Failed
          </span>
        );
      case 'tabled':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'>
            <MinusCircle size={12} />
            Tabled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className='w-full text-left border-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-md  hover:border-blue-400 dark:hover:border-blue-600 transition-all overflow-hidden max-w-xl group'
    >
      <div className='flex gap-3 p-4 w-full'>
        <div className='flex-shrink-4'>
          <div className='w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600'>
            <Image
              src={motionAvatar}
              alt='Motion avatar'
              width={48}
              height={48}
              className='w-full h-full'
              unoptimized
            />
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold mb-1 text-base line-clamp-1'>
            {motion.title}
          </h3>

          <p className='text-xs opacity-75 mb-2 truncate'>
            Proposed by <span className='font-medium'>{mover.name}</span>
            {seconder && (
              <>
                {' '}
                • Seconded by{' '}
                <span className='font-medium'>{seconder.name}</span>
              </>
            )}
          </p>

          {totalVotes > 0 ? (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs font-medium'>
                <span>
                  {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </span>
                <div className='flex gap-3'>
                  <span className='flex items-center gap-1'>
                    <CheckCircle2 size={12} />
                    {ayeCount}
                  </span>
                  <span className='flex items-center gap-1'>
                    <MinusCircle size={12} />
                    {abstainCount}
                  </span>
                  <span className='flex items-center gap-1'>
                    <XCircle size={12} />
                    {nayCount}
                  </span>
                </div>
              </div>

              <div className='h-2 w-full rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700'>
                {ayeCount > 0 && (
                  <div
                    className='bg-white dark:bg-black h-full'
                    style={{ width: `${ayePercentage}%` }}
                  />
                )}
                {abstainCount > 0 && (
                  <div
                    className='bg-gray-400 dark:bg-gray-500 h-full'
                    style={{ width: `${abstainPercentage}%` }}
                  />
                )}
                {nayCount > 0 && (
                  <div
                    className='bg-black dark:bg-white h-full'
                    style={{ width: `${nayPercentage}%` }}
                  />
                )}
              </div>
            </div>
          ) : (
            <p className='text-xs opacity-75 italic'>
              {motion.status === 'proposed'
                ? 'Click to second and vote'
                : 'Click to vote'}
            </p>
          )}
        </div>

        <div className='flex-shrink-0'>{getStatusBadge()}</div>
      </div>
    </button>
  );
}
