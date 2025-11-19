'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MotionDetailsHeader } from './motion-details-header';
import { MotionDetailsCard } from './motion-details-card';
import { MotionVotingResults } from './motion-voting-results';
import { MotionVotingActions } from './motion-voting-actions';
import { MotionSubmotions } from './motion-submotions';
import { MotionComments } from './motion-comments';

const getMotionData = (motionId: string) => {
  const motions: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Budget Approval for New Equipment',
      description:
        'Motion to approve the purchase of new audio equipment for the conference room, not to exceed $5,000. This will enhance our meeting capabilities.',
      status: 'open',
      mover: 'John Smith',
      seconder: 'Sarah Johnson',
      votes: {
        aye: 20,
        nay: 10,
        abstain: 2,
        total: 32,
      },
      comments: [
        {
          user: 'Mike Davis',
          text: 'I think this is necessary for our remote meetings',
          time: '2 min ago',
        },
        {
          user: 'Lisa Wilson',
          text: 'Can we get quotes from multiple vendors?',
          time: '5 min ago',
        },
      ],
      submotions: [
        {
          id: '1a',
          title: 'Amendment: Reduce budget to $4,000',
          status: 'proposed',
        },
      ],
    },
    '2': {
      id: '2',
      title: 'Policy Update for Remote Work',
      description:
        'Motion to update the remote work policy to allow 3 days per week remote work for all eligible employees.',
      status: 'proposed',
      mover: 'Emily Garcia',
      seconder: null,
      votes: { aye: 0, nay: 0, abstain: 0, total: 0 },
      comments: [],
      submotions: [],
    },
  };
  return motions[motionId] || null;
};

export default function MotionDetails() {
  const params = useParams();
  const router = useRouter();
  const committeeId = params.id as string;
  const motionId = params.motionId as string;

  const motion = getMotionData(motionId);

  if (!motion) {
    return (
      <div className='h-[calc(100vh-4rem)] flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold mb-2'>Motion Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[calc(100vh-4rem)] lg:h-screen flex flex-col'>
      <MotionDetailsHeader motion={motion} committeeId={committeeId} />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        <MotionDetailsCard motion={motion} />
        <MotionVotingResults motion={motion} />
        <MotionVotingActions motion={motion} />
        <MotionSubmotions motion={motion} />
        <MotionComments motion={motion} />
      </div>
    </div>
  );
}