'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { useMotion } from '@/hooks/api/use-motions';
import { useCommittee } from '@/hooks/api/use-commitee';
import { useWebSocket } from '@/hooks/use-web-socket';
import { MotionDetailsHeader } from './motion-details-header';
import { MotionDetailsCard } from './motion-details-card';
import { MotionVotingResults } from './motion-voting-results';
import { MotionVotingActions } from './motion-voting-actions';
import { MotionComments } from './motion-comments';
import { User } from 'next-auth';
import { Motion as MotionType } from '@/models/motion';

export default function MotionDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const committeeId = params.id as string;
  const motionId = params.motionId as string;

  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentMotion, setCurrentMotion] = useState<MotionType | null>(null);

  const {
    data: motionData,
    loading: motionLoading,
    error: motionError,
  } = useMotion({
    resourceParams: [committeeId, motionId],
    enabled: !!committeeId && !!motionId && !!session?.apiToken,
  });

  const { data: committeeData, loading: committeeLoading } = useCommittee({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  const transformMotion = (motion: any) => ({
    ...motion,
    moverId: motion.mover_id || motion.moverId,
    seconderId: motion.seconder_id || motion.seconderId,
    committeeId: motion.committee_id || motion.committeeId,
    createdAt: motion.created_at || motion.createdAt,
    updatedAt: motion.updated_at || motion.updatedAt,
    votingEndsAt: motion.voting_ends_at || motion.votingEndsAt,
    votes:
      motion.votes?.map((vote: any) => ({
        ...vote,
        id: vote._id || vote.id,
        motionId: vote.motion_id || vote.motionId,
        userId: vote.user_id || vote.userId,
        createdAt: vote.created_at || vote.createdAt,
      })) || [],
  });

  const handleMotionEvent = (payload: any) => {
    if (payload.action === 'motion_seconded' && payload.payload?.motion) {
      const transformedMotion = transformMotion(payload.payload.motion);
      if (transformedMotion.id === motionId) {
        setCurrentMotion(transformedMotion);
      }
    } else if (payload.action === 'vote_cast' && payload.payload?.motion) {
      const transformedMotion = transformMotion(payload.payload.motion);
      if (transformedMotion.id === motionId) {
        setCurrentMotion(transformedMotion);
      }
    }
  };

  const { isConnected, secondMotion, voteOnMotion, joinRoom } = useWebSocket({
    onMessage: (payload: any) => {
      if (
        payload.action &&
        ['motion_seconded', 'vote_cast'].includes(payload.action)
      ) {
        handleMotionEvent(payload);
      }
    },
    onConnect: () => {},
    onDisconnect: () => {},
  });

  useEffect(() => {
    if (committeeData?.committee) {
      const rid = `committee_${committeeId}`;
      setRoomId(rid);
    }
  }, [committeeData, committeeId]);

  useEffect(() => {
    if (roomId && isConnected) {
      joinRoom(roomId);
    }
  }, [roomId, isConnected, joinRoom]);

  useEffect(() => {
    if (motionData?.motion) {
      setCurrentMotion(motionData.motion);
    }
  }, [motionData]);

  const handleVoteMotion = async (
    motionId: string,
    vote: 'aye' | 'nay' | 'abstain',
  ) => {
    if (!roomId || !isConnected) return;
    try {
      voteOnMotion(roomId, motionId, vote);
    } catch (error) {
      console.error('Failed to vote on motion:', error);
    }
  };

  const handleSecondMotion = async (motionId: string) => {
    if (!roomId || !isConnected) return;
    try {
      secondMotion(roomId, motionId);
    } catch (error) {
      console.error('Failed to second motion:', error);
    }
  };

  const loading = motionLoading || committeeLoading;

  if (loading) {
    return (
      <div className='h-[calc(100vh-4rem)] flex items-center justify-center'>
        <DefaultLoader />
      </div>
    );
  }

  if (motionError || !motionData?.motion) {
    return (
      <div className='h-[calc(100vh-4rem)] flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold mb-2'>Motion Not Found</h1>
          <p className='text-sm text-muted-foreground mb-4'>
            {motionError
              ? 'Failed to load motion'
              : 'This motion does not exist or you do not have access to it'}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const motion = currentMotion || motionData?.motion;
  const users = motionData?.users || [];
  const messages = motionData?.messages || [];
  const committee = committeeData?.committee;
  if (!motion) {
    return (
      <div className='h-[calc(100vh-4rem)] flex items-center justify-center'>
        <DefaultLoader />
      </div>
    );
  }

  const totalMembers =
    (committee?.chairId ? 1 : 0) + (committee?.memberIds?.length || 0);

  const mover = users.find((u: User) => u.id === motion.mover_id);
  const seconder = motion.seconder_id
    ? users.find((u: User) => u.id === motion.seconder_id)
    : undefined;

  return (
    <div className='h-[calc(100vh-4rem)] lg:h-screen flex flex-col'>
      <MotionDetailsHeader
        motion={motion}
        committeeId={committeeId}
        mover={mover}
        seconder={seconder}
      />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        <MotionDetailsCard motion={motion} />
        <MotionVotingResults motion={motion} totalMembers={totalMembers} />
        <MotionVotingActions
          motion={motion}
          currentUserId={session?.user?.id}
          onVote={handleVoteMotion}
          onSecond={handleSecondMotion}
        />
        <MotionComments
          motion={motion}
          users={users}
          messages={messages}
          currentUserId={session?.user?.id || ''}
          committeeId={committeeId}
        />
      </div>
    </div>
  );
}
