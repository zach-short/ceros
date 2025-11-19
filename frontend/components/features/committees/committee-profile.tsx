'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { useCommittee } from '@/hooks/api/use-commitee';
import { useCommitteeHistory } from '@/hooks/api/use-committee-chat';
import { Committee } from '@/models/committee';
import { User } from '@/components/features/chat/ui/types';
import { Users, Settings, MessageSquare, FileText } from 'lucide-react';
import { CommitteeSettingsSheet } from './committee-settings-sheet';
import { CommitteeMembersSheet } from '../chat/committee/sheets/committee-members-sheet';
import { CommitteeMotionsSheet } from '../chat/committee/sheets/committee-motions-sheet';
import { getCommitteePicture } from '@/lib/utils/committee-avatar';
import { useWebSocket } from '@/hooks/use-web-socket';
import { ShareButton } from '@/components/shared/share-button';

interface CommitteeProfileProps {
  committeeId: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getCommitteeTypeDisplay = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType === 'temporary') {
    return {
      label: 'Temporary Committee',
      color: 'bg-amber-500',
      ringColor: 'ring-amber-500/20',
    };
  }
  return {
    label: 'Permanent Committee',
    color: 'bg-green-500',
    ringColor: 'ring-green-500/20',
  };
};

export function CommitteeProfile({ committeeId }: CommitteeProfileProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [membersSheetOpen, setMembersSheetOpen] = useState(false);
  const [motionsSheetOpen, setMotionsSheetOpen] = useState(false);

  const {
    data: committeeData,
    loading,
    refetch,
  } = useCommittee({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  const { data: historyData } = useCommitteeHistory(
    committeeId,
    !!session?.apiToken && !!committeeId,
  );

  const committee = committeeData?.committee;
  const members = historyData?.members || [];
  const motions = historyData?.motions || [];
  const roomId = historyData?.roomId;
  const isOwner = committee?.ownerId === session?.user?.id;
  const isChair = committee?.chairId === session?.user?.id;
  const canManageSettings = isOwner || isChair;

  const { proposeMotion } = useWebSocket({});

  const handleCreateMotion = async (title: string, description: string) => {
    if (!committeeId || !roomId) return;
    proposeMotion(roomId, title, description, committeeId);
  };

  if (loading) {
    return (
      <CenteredDiv className='!h-[60vh]'>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (!committee) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Users className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='mb-2 text-lg font-semibold'>Committee not found</h3>
        <p className='text-muted-foreground mb-4'>
          This committee may not exist or you don&apos;t have access to it
        </p>
        <Button onClick={() => router.push('/')}>Back to Chats</Button>
      </div>
    );
  }

  const memberCount =
    (committee.ownerId ? 1 : 0) +
    (committee.chairId ? 1 : 0) +
    (committee.memberIds?.length || 0);

  const typeDisplay = getCommitteeTypeDisplay(committee.type);

  return (
    <TooltipProvider>
      <div className='container mx-auto p-6 max-w-4xl'>
        <div className='fixed bottom-20 right-1/2 transform translate-x-1/2 flex gap-2'>
          <Button
            onClick={() => router.push(`/committees/${committeeId}`)}
            className='bg-blue-600 hover:bg-blue-700 text-white'
            size='sm'
          >
            <MessageSquare size={16} className='mr-2' />
            Back to Chat
          </Button>
          {canManageSettings && (
            <Button
              onClick={() => setSettingsOpen(true)}
              variant='outline'
              size='sm'
            >
              <Settings size={16} className='mr-2' />
              Settings
            </Button>
          )}
        </div>

        <div className='space-y-6'>
          <Card>
            <CardContent className='relative py-6'>
              <div className='absolute top-4 right-4'>
                <ShareButton
                  title={`${committee.name}`}
                  text={`View ${committee.name} on Ceros`}
                  url={typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_APP_URL}/committees/${committeeId}/profile`}
                />
              </div>
              <div className='flex items-start gap-4'>
                <div className='relative'>
                  <Avatar className='w-20 h-20'>
                    <AvatarImage src={getCommitteePicture(committee)} />
                    <AvatarFallback>
                      {committee.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute bottom-0 right-0 w-5 h-5 ${typeDisplay.color} rounded-full border-2 border-background cursor-help ring-4 ${typeDisplay.ringColor}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{typeDisplay.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className='flex-1'>
                  <h1 className='text-2xl font-bold'>{committee.name}</h1>
                  {committee.createdAt && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      Created {formatDate(committee.createdAt)}
                    </p>
                  )}
                  <div className='flex items-center gap-4 mt-3 text-sm text-muted-foreground'>
                    <button
                      onClick={() => setMembersSheetOpen(true)}
                      className='flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer'
                    >
                      <Users size={16} />
                      <span className='underline decoration-dotted'>
                        {memberCount} member{memberCount !== 1 ? 's' : ''}
                      </span>
                    </button>
                    •
                    {committee.observerIds &&
                      committee.observerIds.length > 0 && (
                        <span>
                          {committee.observerIds.length} observer
                          {committee.observerIds.length !== 1 ? 's' : ''}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {committee.description && (
                <div className='mt-6'>
                  <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                    {committee.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle>Motions</CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setMotionsSheetOpen(true)}
                className='text-sm'
              >
                <FileText size={16} className='mr-2' />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {motions.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-sm text-muted-foreground'>
                    No motions yet
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Motions and votes will appear here
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {motions
                    .filter((m) =>
                      ['proposed', 'seconded', 'open'].includes(m.status),
                    )
                    .slice(0, 3)
                    .map((motion) => (
                      <div
                        key={motion.id}
                        onClick={() => setMotionsSheetOpen(true)}
                        className='p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors'
                      >
                        <h4 className='font-medium mb-1'>{motion.title}</h4>
                        <p className='text-sm text-muted-foreground line-clamp-2'>
                          {motion.description}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          <Badge variant='secondary' className='text-xs'>
                            {motion.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {motions.filter((m) =>
                    ['proposed', 'seconded', 'open'].includes(m.status),
                  ).length === 0 && (
                    <div className='text-center py-8'>
                      <p className='text-sm text-muted-foreground'>
                        No active motions
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Click &quot;View All&quot; to see past motions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {canManageSettings && (
        <CommitteeSettingsSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          committee={committee}
          members={members}
          onUpdate={refetch}
        />
      )}

      <CommitteeMembersSheet
        open={membersSheetOpen}
        onOpenChange={setMembersSheetOpen}
        members={members}
        committee={committee}
      />

      <CommitteeMotionsSheet
        open={motionsSheetOpen}
        onOpenChange={setMotionsSheetOpen}
        motions={motions}
        committee={committee}
        onCreateMotion={handleCreateMotion}
        isSubmitting={false}
      />
    </TooltipProvider>
  );
}
