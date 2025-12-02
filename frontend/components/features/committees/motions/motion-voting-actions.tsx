'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Motion } from '@/models/motion';

interface MotionVotingActionsProps {
  motion: Motion;
  currentUserId?: string;
  onVote?: (motionId: string, vote: 'aye' | 'nay' | 'abstain') => void;
  onSecond?: (motionId: string) => void;
}

export function MotionVotingActions({
  motion,
  currentUserId,
  onVote,
  onSecond
}: MotionVotingActionsProps) {
  const handleVote = (vote: 'aye' | 'nay' | 'abstain') => {
    if (!onVote) {
      toast.error('Voting functionality not available');
      return;
    }
    onVote(motion.id, vote);
  };

  const handleSecond = () => {
    if (!onSecond) {
      toast.error('Seconding functionality not available');
      return;
    }
    onSecond(motion.id);
  };

  // Check if user has already voted
  const userVote = currentUserId
    ? motion.votes?.find(v => v.user_id === currentUserId)
    : undefined;

  if (motion.status === 'proposed' && !motion.seconder_id) {
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
        <h2 className='font-medium mb-3'>
          {userVote ? `You voted: ${userVote.result.toUpperCase()}` : 'Cast Your Vote'}
        </h2>
        <div className='grid grid-cols-3 gap-2'>
          <Button
            onClick={() => handleVote('aye')}
            variant={userVote?.result === 'aye' ? 'default' : 'outline'}
            className={
              userVote?.result === 'aye'
                ? ''
                : 'text-green-600 hover:bg-green-50'
            }
          >
            Aye
          </Button>
          <Button
            onClick={() => handleVote('nay')}
            variant={userVote?.result === 'nay' ? 'default' : 'outline'}
            className={
              userVote?.result === 'nay' ? '' : 'text-red-600 hover:bg-red-50'
            }
          >
            Nay
          </Button>
          <Button
            onClick={() => handleVote('abstain')}
            variant={userVote?.result === 'abstain' ? 'default' : 'outline'}
          >
            Abstain
          </Button>
        </div>
      </div>
    );
  }

  return null;
}