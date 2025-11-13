'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { EmptyMotions } from './empty-motions';
import { CreateMotionDialog } from './create-motion-dialog';
import { useCommittee } from '@/hooks/api/use-commitee';
import { useCommitteeMotions, useCreateMotion } from '@/hooks/api/use-motions';
import { useWebSocket } from '@/hooks/use-web-socket';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Motion } from '@/models/motion';

export default function CommitteeMotions() {
  const params = useParams();
  const router = useRouter();
  const committeeId = params.id as string;
  const { data: session } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [motions, setMotions] = useState<Motion[]>([]);

  const { data: committeeData, loading: committeeLoading } = useCommittee({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  const { data: motionsData, loading: motionsLoading, mutate } = useCommitteeMotions({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  const roomId = `committee_${committeeId}`;

  const { proposeMotion } = useWebSocket({
    onMessage: (payload: any) => {
      if (payload.action === 'motion_proposed') {
        mutate();
      }
    },
  });

  const { mutate: createMotion, loading: creatingMotion } = useCreateMotion(
    committeeId,
    {
      onSuccess: (data) => {
        setMotions((prev) => {
          const exists = prev.some((m) => m.id === data.motion.id);
          if (exists) return prev;
          return [...prev, data.motion];
        });
        setIsCreateDialogOpen(false);
        toast.success('Motion proposed successfully!');
        if (roomId) {
          proposeMotion(roomId, committeeId, data.motion.title, data.motion.description);
        }
        mutate();
      },
      onError: (error) => {
        console.error('Failed to create motion:', error);
        toast.error('Failed to create motion. Please try again.');
      },
    },
  );

  useEffect(() => {
    if (motionsData?.motions) {
      setMotions(motionsData.motions);
    }
  }, [motionsData]);

  const handleCreateMotion = async (title: string, description: string) => {
    await createMotion({ title, description });
  };

  if (committeeLoading || motionsLoading) {
    return (
      <div className='h-[calc(100vh-4rem)] lg:h-screen flex items-center justify-center'>
        <DefaultLoader />
      </div>
    );
  }

  const activeMotionsCount = motions.filter(m =>
    ['proposed', 'seconded', 'open'].includes(m.status)
  ).length;

  return (
    <>
      <div className='h-[calc(100vh-4rem)] lg:h-screen flex flex-col'>
        <header className='p-4 border-b flex items-center gap-3'>
          <button
            onClick={() => router.push(`/committees/${committeeId}`)}
            className='p-2 hover:bg-accent rounded-full'
          >
            <ArrowLeft size={20} />
          </button>
          <div className='flex-1'>
            <h1 className='font-semibold'>{committeeData?.committee?.name || 'Committee'} Motions</h1>
            <p className='text-sm opacity-75'>
              {motions.length === 0
                ? 'No motions yet'
                : `${motions.length} total motion${motions.length !== 1 ? 's' : ''} • ${activeMotionsCount} active`
              }
            </p>
          </div>
          {activeMotionsCount === 0 && (
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus size={16} className="mr-1" />
              New Motion
            </Button>
          )}
        </header>

        <div className='flex-1 overflow-y-auto'>
          {motions.length === 0 ? (
            <EmptyMotions onCreateClick={() => setIsCreateDialogOpen(true)} />
          ) : (
            <div className='p-4 space-y-4'>
              {/* Motion list will go here */}
              <p className='text-sm opacity-75'>Motion list coming soon...</p>
            </div>
          )}
        </div>
      </div>

      <CreateMotionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateMotion}
        isSubmitting={creatingMotion}
      />
    </>
  );
}