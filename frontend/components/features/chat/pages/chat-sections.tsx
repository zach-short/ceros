'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Users } from 'lucide-react';
import { ConversationsList } from '@/components/features/chat/conversations/conversations-list';
import { CommitteeList } from '@/components/features/chat/committee/committee-list';
import { Committee } from '@/models/committee';

interface ChatSectionsProps {
  conversationsCount: number;
  committeesCount: number;
  committees: Committee[];
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

function GroupChatsSection({
  committeesCount,
  committees,
}: {
  committeesCount: number;
  committees: Committee[];
}) {
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
        <span className='font-medium'>Committees</span>
        <span className='text-sm opacity-60'>({committeesCount})</span>
      </button>

      <div className={groupChatsExpanded ? 'block' : 'hidden'}>
        <CommitteeList committees={committees} />
      </div>
    </div>
  );
}

export function ChatSections({
  conversationsCount,
  committeesCount,
  committees,
}: ChatSectionsProps) {
  return (
    <div className='p-6 space-y-6'>
      <GroupChatsSection
        committeesCount={committeesCount}
        committees={committees}
      />
      <DirectMessagesSection conversationsCount={conversationsCount} />
    </div>
  );
}
