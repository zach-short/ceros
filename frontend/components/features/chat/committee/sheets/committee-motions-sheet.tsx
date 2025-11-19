'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Committee } from '@/models/committee';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CreateMotionDialog } from '@/components/features/committees/motions/create-motion-dialog';

interface CommitteeMotionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motions: any[];
  committee: Committee | null;
  onCreateMotion: (title: string, description: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function CommitteeMotionsSheet({
  open,
  onOpenChange,
  motions,
  committee,
  onCreateMotion,
  isSubmitting = false,
}: CommitteeMotionsSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const side = isDesktop ? 'right' : 'bottom';
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const activeMotionsCount = motions.filter((m) =>
    ['proposed', 'seconded', 'open'].includes(m.status),
  ).length;
  const hasActiveMotion = activeMotionsCount > 0;

  const handleCreateMotion = async (title: string, description: string) => {
    await onCreateMotion(title, description);
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={side} className='w-full sm:max-w-md'>
          <SheetHeader>
            <div className='flex items-center justify-between'>
              <div>
                <SheetTitle>
                  {committee?.name || 'Committee'} Motions
                </SheetTitle>
                <SheetDescription>
                  {motions.length} motion{motions.length !== 1 ? 's' : ''} •{' '}
                  {activeMotionsCount} active
                </SheetDescription>
              </div>
              {!hasActiveMotion && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  size='sm'
                  className='ml-2'
                >
                  <Plus size={16} className='mr-1' />
                  New
                </Button>
              )}
            </div>
            {hasActiveMotion && (
              <p className='text-xs text-muted-foreground pt-1'>
                Complete the active motion before proposing a new one
              </p>
            )}
          </SheetHeader>

          <div className='px-6 flex-1 overflow-y-auto -mx-4 '>
            {motions.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='opacity-60 mb-2'>
                  <svg
                    className='w-16 h-16 mx-auto mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <h3 className='font-medium mb-1'>No motions yet</h3>
                <p className='text-sm opacity-60'>
                  Motions will appear here when they are created
                </p>
              </div>
            ) : (
              <div className='space-y-3 pb-4'>
                {motions.map((motion) => (
                  <div
                    key={motion.id}
                    className='p-4 border rounded-lg hover:bg-accent cursor-pointer'
                  >
                    <h4 className='font-medium mb-1'>{motion.title}</h4>
                    <p className='text-sm opacity-60 line-clamp-2'>
                      {motion.description}
                    </p>
                    <div className='flex items-center gap-4 mt-2 text-xs opacity-60'>
                      <span>{motion.status}</span>
                      <span>•</span>
                      <span>{motion.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CreateMotionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateMotion}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
