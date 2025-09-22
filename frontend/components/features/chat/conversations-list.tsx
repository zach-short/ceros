'use client';

import { useConversations } from '@/hooks/api/use-chat';
import { ConversationItem } from './conversation-item';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { ConversationSummary } from '@/lib/api/chat';

interface ConversationsListProps {
  searchQuery?: string;
}

export function ConversationsList({
  searchQuery,
}: ConversationsListProps = {}) {
  const { data: conversationsData, loading, error } = useConversations();

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <DefaultLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-500'>Failed to load conversations</p>
        <p className='text-sm text-gray-500'>Please try refreshing the page</p>
      </div>
    );
  }

  const conversations = conversationsData?.conversations || [];

  if (conversations.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='max-w-md mx-auto'>
          <h3 className='text-lg font-medium mb-2'>No conversations yet</h3>
          <p className='text-gray-500'>
            Start a conversation by visiting a friend&apos;s profile and sending
            them a message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg border'>
      <div className='gap-y-2'>
        {conversations.map((conversation: ConversationSummary) => (
          <ConversationItem
            key={conversation.roomId}
            conversation={conversation}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
