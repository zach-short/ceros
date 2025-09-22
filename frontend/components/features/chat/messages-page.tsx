'use client';

import { useState, useMemo } from 'react';
import { useConversations } from '@/hooks/api/use-chat';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { ChatSearch } from '@/components/features/chat/chat-search';
import { ChatSearchResults } from '@/components/features/chat/chat-search-results';
import { ChatSections } from '@/components/features/chat/chat-sections';

const dummyCommittees = [
  {
    id: '507f1f77bcf86cd799439011',
    name: 'Budget Committee',
    memberCount: 12,
    lastActivity: '2 hours ago',
    unreadCount: 3,
  },
  {
    id: '507f1f77bcf86cd799439012',
    name: 'Policy Review Committee',
    memberCount: 8,
    lastActivity: '1 day ago',
    unreadCount: 0,
  },
  {
    id: '507f1f77bcf86cd799439013',
    name: 'Events Planning Committee',
    memberCount: 15,
    lastActivity: '3 days ago',
    unreadCount: 1,
  },
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: conversationsData, loading: conversationsLoading } =
    useConversations();

  const conversations = conversationsData?.conversations || [];

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        conversations: conversations,
        committees: dummyCommittees,
      };
    }

    const query = searchQuery.toLowerCase();
    return {
      conversations: conversations,
      committees: dummyCommittees.filter((committee) =>
        committee.name.toLowerCase().includes(query),
      ),
    };
  }, [searchQuery, conversations]);

  const showSearchResults = searchQuery.trim().length > 0;

  if (conversationsLoading) {
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
              <p className='opacity-60'>Your conversations and committees</p>
            </div>

            <ChatSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>

          <div className='flex-1 overflow-y-auto'>
            {showSearchResults ? (
              <ChatSearchResults
                searchQuery={searchQuery}
                conversationsCount={filteredResults.conversations.length + filteredResults.committees.length}
              />
            ) : (
              <ChatSections
                conversationsCount={conversations.length}
                committeesCount={dummyCommittees.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}