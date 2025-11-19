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

interface CreateMotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateMotionDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateMotionDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await onSubmit(title.trim(), description.trim());
    setTitle('');
    setDescription('');
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onOpenChange(false);
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
