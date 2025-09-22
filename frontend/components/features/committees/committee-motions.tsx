'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MotionListSection } from './motion-list-section';
import { EmptyMotions } from './empty-motions';

const dummyMotions = [
  {
    id: '1',
    title: 'Budget Approval for New Equipment',
    description:
      'Motion to approve the purchase of new audio equipment for the conference room...',
    status: 'open',
    mover: 'John Smith',
    seconder: 'Sarah Johnson',
    votes: { aye: 20, nay: 10, abstain: 2, total: 32 },
    comments: 2,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'Policy Update for Remote Work',
    description:
      'Motion to update the remote work policy to allow 3 days per week remote work...',
    status: 'proposed',
    mover: 'Emily Garcia',
    seconder: null,
    votes: { aye: 0, nay: 0, abstain: 0, total: 0 },
    comments: 0,
    createdAt: '1 day ago',
  },
  {
    id: '3',
    title: 'Meeting Schedule Change',
    description:
      'Motion to change weekly meetings from Tuesday to Wednesday at 2 PM...',
    status: 'passed',
    mover: 'Mike Davis',
    seconder: 'Lisa Wilson',
    votes: { aye: 25, nay: 5, abstain: 2, total: 32 },
    comments: 5,
    createdAt: '3 days ago',
  },
];

export default function CommitteeMotions() {
  const params = useParams();
  const router = useRouter();
  const committeeId = params.id as string;

  const activeMotions = dummyMotions.filter(
    (m) => m.status === 'open' || m.status === 'proposed',
  );
  const pastMotions = dummyMotions.filter(
    (m) => m.status === 'passed' || m.status === 'failed',
  );

  return (
    <div className='h-[calc(100vh-4rem)] lg:h-screen flex flex-col'>
      <header className='p-4 border-b flex items-center gap-3'>
        <button
          onClick={() => router.push(`/committees/${committeeId}/chat`)}
          className='p-2 hover:bg-accent rounded-full'
        >
          <ArrowLeft size={20} />
        </button>
        <div className='flex-1'>
          <h1 className='font-semibold'>Committee Motions</h1>
          <p className='text-sm opacity-75'>
            {dummyMotions.length} total motions
          </p>
        </div>
      </header>

      <div className='flex-1 overflow-y-auto'>
        {activeMotions.length > 0 && (
          <MotionListSection
            title="Active Motions"
            motions={activeMotions}
            committeeId={committeeId}
            showNewButton={true}
          />
        )}

        {pastMotions.length > 0 && (
          <div className='border-t'>
            <MotionListSection
              title="Past Motions"
              motions={pastMotions}
              committeeId={committeeId}
              isPast={true}
            />
          </div>
        )}

        {dummyMotions.length === 0 && <EmptyMotions />}
      </div>
    </div>
  );
}