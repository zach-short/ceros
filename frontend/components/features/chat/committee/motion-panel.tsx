'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MotionPanelProps {
  onClose: () => void;
  onProposeMotion: (title: string, description: string) => void;
  roomId: string | null;
  committeeId: string;
  onSecondMotion: (roomId: string, motionId: string) => void;
  onVoteMotion: (
    roomId: string,
    motionId: string,
    vote: 'aye' | 'nay' | 'abstain',
  ) => void;
}

export function MotionPanel({
  onClose,
  onProposeMotion,
  roomId,
  onSecondMotion,
  onVoteMotion,
}: MotionPanelProps) {
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [motionTitle, setMotionTitle] = useState('');
  const [motionDescription, setMotionDescription] = useState('');

  const handleSubmitMotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motionTitle.trim() || !motionDescription.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    onProposeMotion(motionTitle.trim(), motionDescription.trim());
    setMotionTitle('');
    setMotionDescription('');
    setShowProposeForm(false);
    toast.success('Motion proposed!');
  };

  const handleSecondMotion = () => {
    if (!roomId) return;
    toast.info('Motion seconding functionality - placeholder for now');
    onSecondMotion(roomId, 'placeholder-motion-id');
  };

  const handleVote = (vote: 'aye' | 'nay' | 'abstain') => {
    if (!roomId) return;
    toast.info(`Vote ${vote} functionality - placeholder for now`);
    onVoteMotion(roomId, 'placeholder-motion-id', vote);
  };

  return (
    <div className='w-full h-full lg:w-80 bg-background border lg:border-l border-border flex flex-col lg:rounded-lg lg:shadow-lg'>
      <div className='p-4 border-b border-border flex justify-between items-center'>
        <button
          onClick={onClose}
          className='hover:opacity-70 text-xl lg:text-base'
        >
          ✕
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        <div className='p-4 rounded-lg border border-border'>
          <h4 className='font-medium mb-3'>Motions</h4>

          {!showProposeForm ? (
            <Button
              onClick={() => setShowProposeForm(true)}
              className='w-full mb-3'
              variant='outline'
            >
              Propose Motion
            </Button>
          ) : (
            <form onSubmit={handleSubmitMotion} className='space-y-3 mb-3'>
              <div>
                <Label htmlFor='motion-title'>Title</Label>
                <Input
                  id='motion-title'
                  value={motionTitle}
                  onChange={(e) => setMotionTitle(e.target.value)}
                  placeholder='Motion title...'
                />
              </div>
              <div>
                <Label htmlFor='motion-description'>Description</Label>
                <textarea
                  id='motion-description'
                  value={motionDescription}
                  onChange={(e) => setMotionDescription(e.target.value)}
                  placeholder='Motion description...'
                  className='w-full p-2 border border-border rounded-md text-sm bg-background'
                  rows={3}
                />
              </div>
              <div className='flex gap-2'>
                <Button type='submit' size='sm' className='flex-1'>
                  Propose
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setShowProposeForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className='space-y-2'>
            <p className='text-sm opacity-75'>Active Motions</p>
            <div className='text-sm opacity-60 italic'>
              No active motions (placeholder)
            </div>
          </div>
        </div>

        <div className='p-4 rounded-lg border border-border'>
          <h4 className='font-medium mb-3'>Quick Actions</h4>
          <div className='space-y-2'>
            <Button
              onClick={handleSecondMotion}
              variant='outline'
              size='sm'
              className='w-full text-left justify-start'
            >
              Second Motion
            </Button>
            <div className='grid grid-cols-3 gap-1'>
              <Button
                onClick={() => handleVote('aye')}
                variant='outline'
                size='sm'
              >
                Aye
              </Button>
              <Button
                onClick={() => handleVote('nay')}
                variant='outline'
                size='sm'
              >
                Nay
              </Button>
              <Button
                onClick={() => handleVote('abstain')}
                variant='outline'
                size='sm'
              >
                Abstain
              </Button>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-lg border border-border'>
          <h4 className='font-medium mb-3'>Committee Management</h4>
          <div className='space-y-2 text-sm opacity-75'>
            <p>Committee CRUD operations</p>
            <p>Motion tracking</p>
            <p>Vote tallying</p>
            <p className='italic'>All placeholder for now</p>
          </div>
        </div>
      </div>
    </div>
  );
}
