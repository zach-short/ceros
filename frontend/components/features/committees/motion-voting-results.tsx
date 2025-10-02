'use client';

interface MotionVotingResultsProps {
  motion: any;
}

export function MotionVotingResults({ motion }: MotionVotingResultsProps) {
  if (motion.status !== 'open' || motion.votes.total === 0) {
    return null;
  }

  const votePercentage = (motion.votes.aye / motion.votes.total) * 100;

  return (
    <div className='p-4 rounded-lg border'>
      <h2 className='font-medium mb-3'>Current Results</h2>
      <div className='space-y-3'>
        <div className='flex justify-between text-sm'>
          <span>
            {motion.votes.aye} for ({Math.round(votePercentage)}%)
          </span>
          <span>
            {motion.votes.nay} against (
            {Math.round((motion.votes.nay / motion.votes.total) * 100)}%)
          </span>
          <span>{motion.votes.abstain} abstain</span>
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
          <div
            className='bg-green-500 h-2 rounded-full transition-all'
            style={{ width: `${votePercentage}%` }}
          ></div>
        </div>
        <p className='text-xs opacity-75'>
          {motion.votes.total} of 30 members voted
        </p>
      </div>
    </div>
  );
}