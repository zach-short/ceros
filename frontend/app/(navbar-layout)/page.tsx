'use client';

import { useSession } from 'next-auth/react';
import { UnifiedAuth } from '@/components/auth/unified-auth';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import MessagesPage from '@/components/features/chat/pages/messages-page';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <CenteredDiv>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (status === 'authenticated') {
    return <MessagesPage />;
  }

  return <UnifiedAuth />;
}
