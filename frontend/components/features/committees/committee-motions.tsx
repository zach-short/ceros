'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { EmptyMotions } from './empty-motions';
import { useCommittee } from '@/hooks/api/use-commitee';
import { DefaultLoader } from '@/components/shared/layout/loader';

export default function CommitteeMotions() {
  const params = useParams();
  const router = useRouter();
  const committeeId = params.id as string;
  const { data: session } = useSession();

  const { data: committeeData, loading } = useCommittee({
    resourceParams: [committeeId],
    enabled: !!committeeId && !!session?.apiToken,
  });

  if (loading) {
    return (
      <div className='h-[calc(100vh-4rem)] lg:h-screen flex items-center justify-center'>
        <DefaultLoader />
      </div>
    );
  }

  return (
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
            No motions yet
          </p>
        </div>
      </header>

      <div className='flex-1 overflow-y-auto'>
        <EmptyMotions />
      </div>
    </div>
  );
}