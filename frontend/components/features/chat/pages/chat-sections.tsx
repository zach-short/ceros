'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Users } from 'lucide-react';
import { ConversationsList } from '@/components/features/chat/conversations/conversations-list';
import { CommitteeList } from '@/components/features/chat/committee/committee-list';

interface ChatSectionsProps {
  conversationsCount: number;
  committeesCount: number;
}

function DirectMessagesSection({
  conversationsCount,
}: {
  conversationsCount: number;
}) {
  const [directMessagesExpanded, setDirectMessagesExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setDirectMessagesExpanded(!directMessagesExpanded)}
        className='flex items-center gap-2 w-full text-left mb-3 hover:opacity-75'
      >
        {directMessagesExpanded ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
        <MessageSquare size={16} />
        <span className='font-medium'>Direct Messages</span>
        <span className='text-sm opacity-60'>({conversationsCount})</span>
      </button>

      <div className={directMessagesExpanded ? 'block' : 'hidden'}>
        <ConversationsList />
      </div>
    </div>
  );
}

function GroupChatsSection({ committeesCount }: { committeesCount: number }) {
  const [groupChatsExpanded, setGroupChatsExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setGroupChatsExpanded(!groupChatsExpanded)}
        className='flex items-center gap-2 w-full text-left mb-3 hover:opacity-75'
      >
        {groupChatsExpanded ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
        <Users size={16} />
        <span className='font-medium'>Group Chats</span>
        <span className='text-sm opacity-60'>({committeesCount})</span>
      </button>

      <div className={groupChatsExpanded ? 'block' : 'hidden'}>
        <div className='rounded-lg border divide-y'>
          <CommitteeList />
        </div>
      </div>
    </div>
  );
}

export function ChatSections({
  conversationsCount,
  committeesCount,
}: ChatSectionsProps) {
  return (
    <div className='p-6 space-y-6'>
      <GroupChatsSection committeesCount={committeesCount} />
      <DirectMessagesSection conversationsCount={conversationsCount} />
    </div>
  );
}

