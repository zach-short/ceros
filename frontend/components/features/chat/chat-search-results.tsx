'use client';

import { MessageSquare, Users } from 'lucide-react';
import { ConversationsList } from '@/components/features/chat/conversations-list';
import { CommitteeList } from '@/components/features/chat/committee-list';

interface ChatSearchResultsProps {
  searchQuery: string;
  conversationsCount: number;
}

export function ChatSearchResults({ searchQuery, conversationsCount }: ChatSearchResultsProps) {
  return (
    <div className='p-6 space-y-6'>
      <div>
        <h3 className='text-sm font-medium opacity-75 mb-3 flex items-center gap-2'>
          <MessageSquare size={16} />
          Direct Messages
        </h3>
        <div className='space-y-2'>
          <div style={{ display: 'block' }}>
            <ConversationsList searchQuery={searchQuery} />
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-sm font-medium opacity-75 mb-3 flex items-center gap-2'>
          <Users size={16} />
          Committees
        </h3>
        <CommitteeList searchQuery={searchQuery} showMemberCount={false} />
      </div>

      {conversationsCount === 0 && (
        <div className='text-center py-12'>
          <p className='opacity-60'>No results found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}