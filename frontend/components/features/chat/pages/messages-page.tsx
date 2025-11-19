'use client';

import { useState, useMemo } from 'react';
import { useConversations } from '@/hooks/api/use-chat';
import { useUserCommittees } from '@/hooks/api/use-commitee';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { ChatSearch } from '@/components/features/chat/search/chat-search';
import { ChatSearchResults } from '@/components/features/chat/search/chat-search-results';
import { ChatSections } from '@/components/features/chat/pages/chat-sections';

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: conversationsData, loading: conversationsLoading } =
    useConversations();
  const { data: committeesData, loading: committeesLoading } =
    useUserCommittees();

  const conversations = useMemo(
    () => conversationsData?.conversations || [],
    [conversationsData],
  );
  const committees = useMemo(
    () => committeesData?.committees || [],
    [committeesData],
  );

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        conversations: conversations,
        committees: committees,
      };
    }

    const query = searchQuery.toLowerCase();
    return {
      conversations: conversations,
      committees: committees.filter((committee) =>
        committee.name.toLowerCase().includes(query),
      ),
    };
  }, [searchQuery, conversations, committees]);

  const showSearchResults = searchQuery.trim().length > 0;

  if (conversationsLoading || committeesLoading) {
    return (
      <div className='h-[calc(100vh-4rem)] lg:h-screen flex items-center justify-center'>
        <DefaultLoader />
      </div>
    );
  }

  return (
    <div className='h-[calc(100vh-4rem)] lg:h-screen flex flex-col'>
      <div className='flex-1 overflow-hidden'>
        <div className='max-w-4xl mx-auto h-full flex flex-col'>
          <div className='p-6 border-b'>
            <div className='mb-4'>
              <h1 className='text-2xl font-bold'>Messages</h1>
            </div>

            <ChatSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className='flex-1 overflow-y-auto'>
            {showSearchResults ? (
              <ChatSearchResults
                searchQuery={searchQuery}
                conversationsCount={
                  filteredResults.conversations.length +
                  filteredResults.committees.length
                }
              />
            ) : (
              <ChatSections
                conversationsCount={conversations.length}
                committeesCount={committees.length}
                committees={committees}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
