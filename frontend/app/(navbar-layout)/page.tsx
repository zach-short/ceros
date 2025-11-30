'use client';

import { useSession } from 'next-auth/react';
import { UnifiedAuth } from '@/components/auth/unified-auth';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import LandingPage  from '@/components/landing-page/landing-page'
import MessagesPage from '@/components/features/chat/pages/messages-page';
import { useState } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [showAuth, setShowAuth] = useState(false);

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

  if (showAuth) {
    return <UnifiedAuth />
  }

  return <LandingPage onLoginClick={()=> setShowAuth(true)}/>;
}
