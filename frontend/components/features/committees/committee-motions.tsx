'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Plus,
  Clock,
  CheckCheck,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { EmptyMotions } from './motions/empty-motions';
import { CreateMotionDialog } from './motions/create-motion-dialog';
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

  const {
    data: motionsData,
    loading: motionsLoading,
    refetch,
  } = useCommitteeMotions({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  const roomId = `committee_${committeeId}`;

  const { proposeMotion } = useWebSocket({
    onMessage: (payload: any) => {
      if (payload.action === 'motion_proposed') {
        refetch();
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
          proposeMotion(
            roomId,
            committeeId,
            data.motion.title,
            data.motion.description,
          );
        }
        refetch();
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

  const activeMotionsCount = motions.filter((m) =>
    ['proposed', 'seconded', 'open'].includes(m.status),
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
            <h1 className='font-semibold'>
              {committeeData?.committee?.name || 'Committee'} Motions
            </h1>
            <p className='text-sm opacity-75'>
              {motions.length === 0
                ? 'No motions yet'
                : `${motions.length} total motion${motions.length !== 1 ? 's' : ''} • ${activeMotionsCount} active`}
            </p>
          </div>
          {activeMotionsCount === 0 && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size='sm'
              className={`mr-0 lg:mr-16 mt-1`}
            >
              <Plus size={16} className='mr-1' />
              New Motion
            </Button>
          )}
        </header>

        <div className='flex-1 overflow-y-auto gap-y-4'>
          {motions.length === 0 ? (
            <EmptyMotions onCreateClick={() => setIsCreateDialogOpen(true)} />
          ) : (
            <div className='p-4 gap-y-4'>
              {motions.map((motion) => {
                const getStatusBadge = () => {
                  switch (motion.status) {
                    case 'proposed':
                      return (
                        <Badge
                          variant='secondary'
                          className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        >
                          <Clock size={12} className='mr-1' />
                          Awaiting Second
                        </Badge>
                      );
                    case 'seconded':
                    case 'open':
                      return (
                        <Badge
                          variant='secondary'
                          className='bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        >
                          <Clock size={12} className='mr-1' />
                          Open for Voting
                        </Badge>
                      );
                    case 'passed':
                      return (
                        <Badge
                          variant='secondary'
                          className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        >
                          <CheckCheck size={12} className='mr-1' />
                          Passed
                        </Badge>
                      );
                    case 'failed':
                      return (
                        <Badge
                          variant='secondary'
                          className='bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        >
                          <XCircle size={12} className='mr-1' />
                          Failed
                        </Badge>
                      );
                    case 'tabled':
                      return (
                        <Badge
                          variant='secondary'
                          className='bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        >
                          <MinusCircle size={12} className='mr-1' />
                          Tabled
                        </Badge>
                      );
                    default:
                      return null;
                  }
                };

                const ayeCount =
                  motion.votes?.filter((v) => v.result === 'aye').length || 0;
                const nayCount =
                  motion.votes?.filter((v) => v.result === 'nay').length || 0;
                const totalVotes =
                  ayeCount +
                  nayCount +
                  (motion.votes?.filter((v) => v.result === 'abstain').length ||
                    0);

                return (
                  <Link
                    key={motion.id}
                    href={`/committees/${committeeId}/motion/${motion.id}`}
                  >
                    <div className='p-4 border rounded-lg hover:bg-accent mb-4 cursor-pointer transition-colors'>
                      <div className='flex items-start justify-between gap-4 mb-3'>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-lg mb-1'>
                            {motion.title}
                          </h3>
                          <p className='text-sm text-muted-foreground line-clamp-2'>
                            {motion.description}
                          </p>
                        </div>
                        {getStatusBadge()}
                      </div>

                      {totalVotes > 0 && (
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <CheckCheck
                              size={14}
                              className='text-green-600 dark:text-green-400'
                            />
                            {ayeCount} Aye
                          </span>
                          <span className='flex items-center gap-1'>
                            <XCircle
                              size={14}
                              className='text-red-600 dark:text-red-400'
                            />
                            {nayCount} Nay
                          </span>
                          <span>
                            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
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
