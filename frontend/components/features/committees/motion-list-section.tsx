'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MotionListItem } from './motion-list-item';

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

interface MotionListSectionProps {
  title: string;
  motions: Motion[];
  committeeId: string;
  showNewButton?: boolean;
  isPast?: boolean;
}

export function MotionListSection({
  title,
  motions,
  committeeId,
  showNewButton = false,
  isPast = false,
}: MotionListSectionProps) {
  if (motions.length === 0) {
    return null;
  }

  return (
    <div className='p-4'>
      <div className='flex flex-row items-center justify-between'>
        <h2 className='text-sm font-medium opacity-75 mb-3 flex items-center gap-2'>
          {title} ({motions.length})
        </h2>
        {showNewButton && (
          <Button size='sm' className='flex items-center gap-2 mb-2'>
            <Plus size={16} />
            New Motion
          </Button>
        )}
      </div>
      <div className='space-y-3'>
        {motions.map((motion) => (
          <MotionListItem
            key={motion.id}
            motion={motion}
            committeeId={committeeId}
            isPast={isPast}
          />
        ))}
      </div>
    </div>
  );
}