'use client';

import { Button } from '@/components/ui/button';

export function EmptyMotions() {
  return (
    <div className='flex items-center justify-center h-full'>
      <div className='text-center'>
        <h3 className='font-medium mb-2'>No motions yet</h3>
        <p className='text-sm opacity-75 mb-4'>
          Get started by creating your first motion
        </p>
        <Button>Create Motion</Button>
      </div>
    </div>
  );
}