'use client';

import { Motion, VoteThreshold } from '@/models/motion';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface MotionVotingResultsProps {
  motion: Motion;
  totalMembers: number;
  quorumPercentage?: number;
}

export function MotionVotingResults({
  motion,
  totalMembers,
  quorumPercentage = 50,
}: MotionVotingResultsProps) {
  const tally = useMemo(() => {
    const ayeCount = motion.votes.filter((v) => v.result === 'aye').length;
    const nayCount = motion.votes.filter((v) => v.result === 'nay').length;
    const abstainCount = motion.votes.filter(
      (v) => v.result === 'abstain'
    ).length;
    const totalVoted = ayeCount + nayCount + abstainCount;
    const quorumRequired = Math.ceil((totalMembers * quorumPercentage) / 100);
    const quorumMet = totalVoted >= quorumRequired;

    const votesForPercentage =
      ayeCount + nayCount > 0 ? (ayeCount / (ayeCount + nayCount)) * 100 : 0;

    let requiredPercentage = 50;
    if (motion.vote_threshold === 'two_thirds') {
      requiredPercentage = 66.67;
    } else if (motion.vote_threshold === 'unanimous') {
      requiredPercentage = 100;
    }

    const wouldPass =
      motion.vote_threshold === 'unanimous'
        ? nayCount === 0 && ayeCount > 0
        : votesForPercentage >
          (motion.vote_threshold === 'two_thirds' ? 66.67 : 50);

    return {
      ayeCount,
      nayCount,
      abstainCount,
      totalVoted,
      quorumRequired,
      quorumMet,
      votesForPercentage,
      requiredPercentage,
      wouldPass,
    };
  }, [motion.votes, totalMembers, quorumPercentage, motion.vote_threshold]);

  const getThresholdLabel = (threshold: VoteThreshold) => {
    switch (threshold) {
      case 'simple_majority':
        return 'Simple Majority (>50%)';
      case 'two_thirds':
        return 'Two-Thirds (≥66.67%)';
      case 'unanimous':
        return 'Unanimous';
      default:
        return threshold;
    }
  };

  if (motion.votes.length === 0) {
    return (
      <div className='p-4 rounded-lg border'>
        <h2 className='font-medium mb-3'>Voting</h2>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='opacity-75'>Required:</span>
            <Badge variant='outline'>{getThresholdLabel(motion.vote_threshold)}</Badge>
          </div>
          {motion.requires_quorum && (
            <div className='flex items-center justify-between text-sm'>
              <span className='opacity-75'>Quorum:</span>
              <span>
                {tally.quorumRequired} of {totalMembers} members
              </span>
            </div>
          )}
          <p className='text-sm opacity-75 mt-2'>No votes cast yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 rounded-lg border'>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='font-medium'>
          {motion.status === 'open' ? 'Current Results' : 'Final Results'}
        </h2>
        {motion.status !== 'open' && (
          <Badge variant={motion.status === 'passed' ? 'default' : 'destructive'}>
            {motion.status === 'passed' ? 'Passed' : 'Failed'}
          </Badge>
        )}
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between text-sm'>
          <span className='opacity-75'>Required:</span>
          <Badge variant='outline'>{getThresholdLabel(motion.vote_threshold)}</Badge>
        </div>

        {motion.requires_quorum && (
          <div className='flex items-center justify-between text-sm'>
            <span className='opacity-75'>Quorum:</span>
            <div className='flex items-center gap-2'>
              <span>
                {tally.totalVoted} of {tally.quorumRequired} required
              </span>
              {tally.quorumMet ? (
                <Badge variant='default' className='text-xs'>
                  Met
                </Badge>
              ) : (
                <Badge variant='destructive' className='text-xs'>
                  Not Met
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-green-600 dark:text-green-400'>
              {tally.ayeCount} Aye ({Math.round(tally.votesForPercentage)}%)
            </span>
            <span className='text-red-600 dark:text-red-400'>
              {tally.nayCount} Nay (
              {Math.round(100 - tally.votesForPercentage)}%)
            </span>
            <span className='opacity-75'>{tally.abstainCount} Abstain</span>
          </div>

          <div className='relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
            <div
              className={`h-3 rounded-full transition-all ${
                tally.wouldPass
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${tally.votesForPercentage}%` }}
            />
            <div
              className='absolute top-0 h-3 w-0.5 bg-yellow-500'
              style={{ left: `${tally.requiredPercentage}%` }}
              title={`${tally.requiredPercentage}% required`}
            />
          </div>

          <div className='flex items-center justify-between text-xs'>
            <span className='opacity-75'>
              {tally.totalVoted} of {totalMembers} members voted
            </span>
            {motion.status === 'open' && (
              <span
                className={
                  tally.wouldPass ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                }
              >
                {tally.wouldPass
                  ? 'Currently passing'
                  : 'Currently failing'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}