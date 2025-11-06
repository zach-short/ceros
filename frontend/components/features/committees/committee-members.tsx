'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CommitteeHeader } from './committee-header';
import { CommitteeActions } from './committee-actions';
import { useCommittee } from '@/hooks/api/use-commitee';
import { DefaultLoader } from '@/components/shared/layout/loader';

export default function CommitteeMembers() {
  const params = useParams();
  const committeeId = params.id as string;
  const { data: session } = useSession();

  const { data: committeeData, loading } = useCommittee({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  const committee = committeeData?.committee;

  const totalMembers =
    (committee?.ownerId ? 1 : 0) +
    (committee?.chairId ? 1 : 0) +
    (committee?.memberIds?.length || 0);

  if (loading) {
    return (
      <div className='h-[calc(100vh-4rem)] lg:h-screen flex items-center justify-center'>
        <DefaultLoader />
      </div>
    );
  }

  return (
    <div className='h-[calc(100vh-4rem)] lg:h-screen flex flex-col'>
      <CommitteeHeader
        title={committee?.name || 'Committee Members'}
        subtitle={`${totalMembers} member${totalMembers !== 1 ? 's' : ''}`}
      />

      <div className='flex-1 overflow-y-auto p-6'>
        <div className='text-center py-8 opacity-60'>
          <p>Member management coming soon</p>
        </div>
        <CommitteeActions />
      </div>
    </div>
  );
}

