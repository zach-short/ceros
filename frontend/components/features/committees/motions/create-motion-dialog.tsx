'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { VoteThreshold } from '@/models/motion';

interface CreateMotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    title: string,
    description: string,
    voteThreshold?: VoteThreshold,
    requiresQuorum?: boolean
  ) => Promise<void>;
  isSubmitting?: boolean;
  defaultThreshold?: VoteThreshold;
}

export function CreateMotionDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  defaultThreshold = 'simple_majority',
}: CreateMotionDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [voteThreshold, setVoteThreshold] =
    useState<VoteThreshold>(defaultThreshold);
  const [requiresQuorum, setRequiresQuorum] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await onSubmit(
      title.trim(),
      description.trim(),
      voteThreshold,
      requiresQuorum
    );
    setTitle('');
    setDescription('');
    setVoteThreshold(defaultThreshold);
    setRequiresQuorum(true);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setVoteThreshold(defaultThreshold);
    setRequiresQuorum(true);
    onOpenChange(false);
  };

  const getThresholdLabel = (threshold: VoteThreshold) => {
    switch (threshold) {
      case 'simple_majority':
        return 'Simple Majority (>50%)';
      case 'two_thirds':
        return 'Two-Thirds Majority (≥66.67%)';
      case 'unanimous':
        return 'Unanimous Consent';
      default:
        return threshold;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Motion</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='motion-title'>Motion Title *</Label>
              <Input
                id='motion-title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g., Approve Budget for 2025'
                required
                disabled={isSubmitting}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='motion-description'>Description *</Label>
              <Textarea
                id='motion-description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Provide details about the motion...'
                rows={6}
                required
                disabled={isSubmitting}
                className='resize-none'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='vote-threshold'>Vote Threshold</Label>
              <Select
                value={voteThreshold}
                onValueChange={(value) =>
                  setVoteThreshold(value as VoteThreshold)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id='vote-threshold'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='simple_majority'>
                    {getThresholdLabel('simple_majority')}
                  </SelectItem>
                  <SelectItem value='two_thirds'>
                    {getThresholdLabel('two_thirds')}
                  </SelectItem>
                  <SelectItem value='unanimous'>
                    {getThresholdLabel('unanimous')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='requires-quorum'
                checked={requiresQuorum}
                onCheckedChange={(checked) =>
                  setRequiresQuorum(checked as boolean)
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor='requires-quorum'
                className='text-sm font-normal cursor-pointer'
              >
                Requires quorum to pass
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !title.trim() || !description.trim()}
            >
              {isSubmitting ? 'Proposing...' : 'Propose Motion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
