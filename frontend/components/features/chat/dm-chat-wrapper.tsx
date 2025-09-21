'use client';

import { DMChat } from './dm-chat';
import { useFetch } from '@/hooks/use-fetch';
import { usersApi, PublicProfileUser } from '@/lib/api/users';

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
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-2 text-gray-500'>Loading chat...</p>
        </div>
      </div>
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

