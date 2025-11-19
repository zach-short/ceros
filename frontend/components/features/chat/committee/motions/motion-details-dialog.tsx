'use client';

import { Motion } from '@/models/motion';
import { User } from '@/models';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MotionCard } from './motion-card';

interface MotionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motion: Motion;
  mover: User;
  seconder?: User;
  currentUserId: string;
  onVote: (motionId: string, vote: 'aye' | 'nay' | 'abstain') => void;
  onSecond?: (motionId: string) => void;
  isSubmitting?: boolean;
}

export function MotionDetailsDialog({
  open,
  onOpenChange,
  motion,
  mover,
  seconder,
  currentUserId,
  onVote,
  onSecond,
  isSubmitting = false,
}: MotionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <MotionCard
          motion={motion}
          mover={mover}
          seconder={seconder}
          currentUserId={currentUserId}
          onVote={onVote}
          onSecond={onSecond}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
