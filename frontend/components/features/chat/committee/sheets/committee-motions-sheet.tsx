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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Archive, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Committee } from '@/models/committee';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CreateMotionDialog } from '@/components/features/committees/motions/create-motion-dialog';
import { EditMotionDialog } from '@/components/features/committees/motions/edit-motion-dialog';
import { MotionToTableDialog } from '@/components/features/committees/motions/motion-to-table-dialog';
import { UntableMotionDialog } from '@/components/features/committees/motions/untable-motion-dialog';
import { Motion } from '@/models/motion';

interface CommitteeMotionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motions: Motion[];
  committee: Committee | null;
  onCreateMotion: (title: string, description: string) => Promise<void>;
  currentUserId?: string;
  isSubmitting?: boolean;
  onMotionUpdated?: () => void;
}

export function CommitteeMotionsSheet({
  open,
  onOpenChange,
  motions,
  committee,
  onCreateMotion,
  currentUserId,
  isSubmitting = false,
  onMotionUpdated,
}: CommitteeMotionsSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const side = isDesktop ? 'right' : 'bottom';
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMotion, setEditingMotion] = useState<Motion | null>(null);
  const [tablingMotion, setTablingMotion] = useState<Motion | null>(null);
  const [untablingMotion, setUntablingMotion] = useState<Motion | null>(null);

  const activeMotionsCount = motions.filter((m) =>
    ['proposed', 'seconded', 'open'].includes(m.status),
  ).length;
  const hasActiveMotion = activeMotionsCount > 0;

  const handleCreateMotion = async (title: string, description: string) => {
    await onCreateMotion(title, description);
    setIsCreateDialogOpen(false);
  };

  const canEditMotion = (
    committee: Committee | null,
    motion: Motion,
  ): boolean => {
    if (!committee) return false;
    const isOwner = committee.ownerId === currentUserId;
    const isChair = committee.chairId === currentUserId;
    const isProposer = motion.mover_id === currentUserId;

    return isOwner || isChair || isProposer;
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
                  <div key={motion.id} className='p-4 border rounded-lg '>
                    <div className='flex items-start justify-between gap-2 mb-1'>
                      <h4 className='font-medium flex-1'>{motion.title}</h4>
                      <div className='flex gap-1'>
                        {canEditMotion(committee, motion) && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setEditingMotion(motion)}
                            className='h-8 w-8 p-0'
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className='text-sm opacity-60 line-clamp-2'>
                      {motion.description}
                    </p>
                    <div className='flex items-center gap-2 mt-2 text-xs flex-wrap'>
                      <span className='opacity-60'>{motion.status}</span>
                      {motion.motion_type === 'to_table' && (
                        <Badge variant='secondary' className='text-xs'>
                          Special Motion: To Table
                        </Badge>
                      )}
                      {motion.motion_type === 'main' &&
                        (motion.status === 'proposed' ||
                          motion.status === 'seconded' ||
                          motion.status === 'open') && (
                          <Badge variant='outline' className='text-xs'>
                            Recording Discussion
                          </Badge>
                        )}
                    </div>

                    {(motion.status === 'proposed' ||
                      motion.status === 'seconded' ||
                      motion.status === 'open') &&
                      currentUserId &&
                      committee &&
                      (committee.ownerId === currentUserId ||
                        committee.chairId === currentUserId) && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setTablingMotion(motion)}
                          className='mt-2 w-full'
                        >
                          <Archive className='h-4 w-4 mr-1' />
                          Move to Table
                        </Button>
                      )}

                    {motion.status === 'tabled' &&
                      currentUserId &&
                      committee &&
                      (committee.ownerId === currentUserId ||
                        committee.chairId === currentUserId) && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setUntablingMotion(motion)}
                          className='mt-2 w-full'
                        >
                          <RotateCcw className='h-4 w-4 mr-1' />
                          Take from Table
                        </Button>
                      )}

                    <Link
                      href={`/committees/${committee?.id}/motion/${motion.id}`}
                    >
                      <Button
                        variant='ghost'
                        size='sm'
                        className='mt-2 w-full text-xs'
                      >
                        View Full Details
                      </Button>
                    </Link>
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

      {editingMotion && committee && (
        <EditMotionDialog
          motion={editingMotion}
          committeeId={committee.id}
          open={!!editingMotion}
          onOpenChange={(open) => !open && setEditingMotion(null)}
          onSuccess={() => {
            onMotionUpdated?.();
          }}
        />
      )}

      {tablingMotion && committee && (
        <MotionToTableDialog
          motion={tablingMotion}
          committeeId={committee.id}
          open={!!tablingMotion}
          onOpenChange={(open) => !open && setTablingMotion(null)}
          onSuccess={() => {
            onMotionUpdated?.();
          }}
        />
      )}

      {untablingMotion && committee && (
        <UntableMotionDialog
          motion={untablingMotion}
          committeeId={committee.id}
          open={!!untablingMotion}
          onOpenChange={(open) => !open && setUntablingMotion(null)}
          onSuccess={() => {
            onMotionUpdated?.();
          }}
        />
      )}
    </>
  );
}
