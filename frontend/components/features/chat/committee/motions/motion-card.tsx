'use client';

import { useState } from 'react';
import { Motion } from '@/models/motion';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/models';
import { getUserDisplayName } from '@/lib/user-utils';
import Link from 'next/link';

interface MotionCardProps {
  motion: Motion;
  mover: User;
  seconder?: User;
  currentUserId: string;
  onVote: (motionId: string, vote: 'aye' | 'nay' | 'abstain') => void;
  onSecond?: (motionId: string) => void;
  isSubmitting?: boolean;
}

export function MotionCard({
  motion,
  mover,
  seconder,
  currentUserId,
  onVote,
  onSecond,
  isSubmitting = false,
}: MotionCardProps) {
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  const ayeCount = motion.votes?.filter((v) => v.result === 'aye').length || 0;
  const nayCount = motion.votes?.filter((v) => v.result === 'nay').length || 0;
  const abstainCount =
    motion.votes?.filter((v) => v.result === 'abstain').length || 0;
  const totalVotes = ayeCount + nayCount + abstainCount;
  const totalCastVotes = ayeCount + nayCount;

  const userVote = motion.votes?.find((v) => v.user_id === currentUserId);
  const hasVoted = !!userVote;

  const ayePercent = totalCastVotes > 0 ? (ayeCount / totalCastVotes) * 100 : 0;
  const nayPercent = totalCastVotes > 0 ? (nayCount / totalCastVotes) * 100 : 0;

  const isPassed = motion.status === 'passed' || ayeCount > nayCount;
  const isFailed =
    motion.status === 'failed' ||
    (nayCount > ayeCount && motion.status !== 'open');

  const canVote =
    motion.status === 'open' && !isSubmitting && !localIsSubmitting;
  const canSecond =
    motion.status === 'proposed' &&
    currentUserId !== motion.mover_id &&
    !isSubmitting &&
    !localIsSubmitting;

  const handleVote = async (vote: 'aye' | 'nay' | 'abstain') => {
    if (!canVote) return;
    setLocalIsSubmitting(true);
    try {
      onVote(motion.id, vote);
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  const handleSecond = async () => {
    if (!canSecond || !onSecond) return;
    setLocalIsSubmitting(true);
    try {
      onSecond(motion.id);
    } finally {
      setLocalIsSubmitting(false);
    }
  };

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
    <div className='border rounded-lg bg-card shadow-sm overflow-hidden max-w-full'>
      <div className='px-4 py-3 border-b bg-muted/30'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <h4 className='font-semibold text-sm'>Motion</h4>
              {getStatusBadge()}
            </div>
            <p className='text-xs opacity-75'>
              Proposed by{' '}
              <span className='font-medium'>{getUserDisplayName(mover)}</span>
              {seconder && (
                <>
                  {' '}
                  • Seconded by{' '}
                  <span className='font-medium'>
                    {getUserDisplayName(seconder)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className='px-4 py-3 space-y-3'>
        <div>
          <h3 className='font-semibold mb-1'>{motion.title}</h3>
          <p className='text-sm opacity-90'>{motion.description}</p>
        </div>

        {motion.status === 'open' ||
        motion.status === 'passed' ||
        motion.status === 'failed' ? (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs font-medium'>
              <span>
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </span>
              {totalCastVotes > 0 && (
                <span
                  className={cn(
                    isPassed && 'text-green-600 dark:text-green-400',
                    isFailed && 'text-red-600 dark:text-red-400',
                  )}
                >
                  {isPassed ? 'Passing' : 'Failing'} ({ayeCount} Aye, {nayCount}{' '}
                  Nay)
                </span>
              )}
            </div>

            {totalCastVotes > 0 && (
              <div className='h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex'>
                <div
                  className='bg-green-500 transition-all duration-300'
                  style={{ width: `${ayePercent}%` }}
                />
                <div
                  className='bg-red-500 transition-all duration-300'
                  style={{ width: `${nayPercent}%` }}
                />
              </div>
            )}

            <div className='grid grid-cols-3 gap-2 text-xs'>
              <div className='flex items-center gap-1'>
                <CheckCircle2
                  size={14}
                  className='text-green-600 dark:text-green-400'
                />
                <span className='font-medium'>{ayeCount}</span>
                <span className='opacity-75'>Aye</span>
              </div>
              <div className='flex items-center gap-1'>
                <XCircle size={14} className='text-red-600 dark:text-red-400' />
                <span className='font-medium'>{nayCount}</span>
                <span className='opacity-75'>Nay</span>
              </div>
              <div className='flex items-center gap-1'>
                <MinusCircle
                  size={14}
                  className='text-gray-600 dark:text-gray-400'
                />
                <span className='font-medium'>{abstainCount}</span>
                <span className='opacity-75'>Abstain</span>
              </div>
            </div>

            {hasVoted && (
              <p className='text-xs opacity-75 italic'>
                You voted:{' '}
                <span className='font-medium capitalize'>
                  {userVote.result}
                </span>
                {canVote && ' (you can change your vote)'}
              </p>
            )}
          </div>
        ) : null}
      </div>
      {/* Actions */}
      <div className='px-4 py-3 border-t bg-muted/30'>
        {motion.status === 'proposed' && canSecond && onSecond && (
          <Button
            onClick={handleSecond}
            disabled={localIsSubmitting || isSubmitting}
            className='w-full'
            size='sm'
          >
            {localIsSubmitting ? 'Seconding...' : 'Second this Motion'}
          </Button>
        )}
        {motion.status === 'proposed' && currentUserId === motion.mover_id && (
          <p className='text-xs text-center opacity-75 italic'>
            Waiting for another member to second this motion
          </p>
        )}
        {motion.status === 'proposed' &&
          !canSecond &&
          currentUserId !== motion.mover_id && (
            <p className='text-xs text-center opacity-75 italic'>
              Waiting for someone to second this motion
            </p>
          )}
        {canVote && (
          <div className='grid grid-cols-3 gap-2'>
            <Button
              onClick={() => handleVote('aye')}
              disabled={localIsSubmitting}
              size='sm'
              variant={userVote?.result === 'aye' ? 'default' : 'outline'}
              className={cn(
                userVote?.result === 'aye' &&
                  'bg-green-600 hover:bg-green-700 border-green-600',
              )}
            >
              <CheckCircle2 size={14} className='mr-1' />
              Aye
            </Button>
            <Button
              onClick={() => handleVote('nay')}
              disabled={localIsSubmitting}
              size='sm'
              variant={userVote?.result === 'nay' ? 'default' : 'outline'}
              className={cn(
                userVote?.result === 'nay' &&
                  'bg-red-600 hover:bg-red-700 border-red-600',
              )}
            >
              <XCircle size={14} className='mr-1' />
              Nay
            </Button>
            <Button
              onClick={() => handleVote('abstain')}
              disabled={localIsSubmitting}
              size='sm'
              variant={userVote?.result === 'abstain' ? 'default' : 'outline'}
              className={cn(
                userVote?.result === 'abstain' &&
                  'bg-gray-600 hover:bg-gray-700 border-gray-600',
              )}
            >
              <MinusCircle size={14} className='mr-1' />
              Abstain
            </Button>
          </div>
        )}
        {!canVote && motion.status === 'open' && (
          <p className='text-xs text-center opacity-75'>Voting...</p>
        )}
        <Link href={`/committees/${motion.committee_id}/motion/${motion.id}`}>
          <Button className={` mt-4`}>View Full Details</Button>
        </Link>
      </div>
    </div>
  );
}
