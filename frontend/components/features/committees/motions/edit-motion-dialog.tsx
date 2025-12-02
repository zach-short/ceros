'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Motion, VoteThreshold } from '@/models/motion';
import { useUpdateMotion } from '@/hooks/api/use-motions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditMotionDialogProps {
  motion: Motion;
  committeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditMotionDialog({
  motion,
  committeeId,
  open,
  onOpenChange,
  onSuccess,
}: EditMotionDialogProps) {
  const [title, setTitle] = useState(motion.title);
  const [description, setDescription] = useState(motion.description);
  const [voteThreshold, setVoteThreshold] = useState<VoteThreshold>(
    motion.vote_threshold,
  );

  const { mutate: updateMotion, loading } = useUpdateMotion(
    committeeId,
    motion.id,
    {
      onSuccess: () => {
        toast.success('Motion updated successfully');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update motion');
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    updateMotion({
      title: title.trim(),
      description: description.trim(),
      vote_threshold: voteThreshold,
    });
  };

  const hasChanges =
    title !== motion.title ||
    description !== motion.description ||
    voteThreshold !== motion.vote_threshold;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Edit Motion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Motion title'
              disabled={loading}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Motion description'
              rows={4}
              disabled={loading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='vote-threshold'>Vote Threshold</Label>
            <Select
              value={voteThreshold}
              onValueChange={(value) =>
                setVoteThreshold(value as VoteThreshold)
              }
              disabled={loading}
            >
              <SelectTrigger id='vote-threshold'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='simple_majority'>
                  Simple Majority (&gt;50%)
                </SelectItem>
                <SelectItem value='two_thirds'>Two-Thirds (≥66.67%)</SelectItem>
                <SelectItem value='unanimous'>Unanimous (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading || !hasChanges}>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
