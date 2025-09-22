'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MotionVotingActionsProps {
  motion: any;
}

export function MotionVotingActions({ motion }: MotionVotingActionsProps) {
  const handleVote = (vote: 'aye' | 'nay' | 'abstain') => {
    toast.info(`Vote ${vote} cast - placeholder functionality`);
  };

  const handleSecond = () => {
    toast.info('Motion seconded - placeholder functionality');
  };

  if (motion.status === 'proposed' && !motion.seconder) {
    return (
      <div className='p-4 rounded-lg border'>
        <h2 className='font-medium mb-3'>Motion Needs Second</h2>
        <Button onClick={handleSecond} className='w-full'>
          Second This Motion
        </Button>
      </div>
    );
  }

  if (motion.status === 'open') {
    return (
      <div className='p-4 rounded-lg border'>
        <h2 className='font-medium mb-3'>Cast Your Vote</h2>
        <div className='grid grid-cols-3 gap-2'>
          <Button
            onClick={() => handleVote('aye')}
            variant='outline'
            className='text-green-600 hover:bg-green-50'
          >
            Aye
          </Button>
          <Button
            onClick={() => handleVote('nay')}
            variant='outline'
            className='text-red-600 hover:bg-red-50'
          >
            Nay
          </Button>
          <Button onClick={() => handleVote('abstain')} variant='outline'>
            Abstain
          </Button>
        </div>
      </div>
    );
  }

  return null;
}