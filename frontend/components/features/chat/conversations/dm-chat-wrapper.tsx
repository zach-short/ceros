'use client';

import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DMChat } from './dm-chat';
import { useFetch } from '@/hooks/use-fetch';
import { usersApi, PublicProfileUser } from '@/lib/api/users';
import { DefaultLoader } from '@/components/shared/layout/loader';

interface DMChatWrapperProps {
  recipientId: string;
}

export function DMChatWrapper({ recipientId }: DMChatWrapperProps) {
  const {
    data: recipientData,
    loading,
    error,
  } = useFetch<PublicProfileUser>(usersApi.getPublicProfile, {
    resourceParams: [recipientId],
    dependencies: [recipientId],
    enabled: !!recipientId,
  });

  if (loading) {
    return (
      <CenteredDiv>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (error || !recipientData) {
    return (
      <div className='text-center p-8'>
        <p className='text-red-500'>Failed to load user profile</p>
        <p className='text-sm text-gray-500'>
          Please check the user ID and try again
        </p>
      </div>
    );
  }

  const recipientName =
    recipientData.name ||
    `${recipientData.givenName || ''} ${recipientData.familyName || ''}`.trim() ||
    'Unknown User';

  return (
    <DMChat
      recipientId={recipientId}
      recipientName={recipientName}
      recipientPicture={recipientData.picture}
    />
  );
}
