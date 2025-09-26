'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

const dummyCommittees: any[] = [];

interface CommitteeListProps {
  searchQuery?: string;
  showMemberCount?: boolean;
}

export function CommitteeList({
  searchQuery = '',
  showMemberCount = true,
}: CommitteeListProps) {
  const router = useRouter();

  const filteredCommittees = searchQuery.trim()
    ? dummyCommittees.filter((committee) =>
        committee.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : dummyCommittees;

  return (
    <div className='space-y-2'>
      {filteredCommittees.map((committee) => (
        <div
          key={committee.id}
          onClick={() => router.push(`/committees/${committee.id}/chat`)}
          className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer'
        >
          <Avatar>
            <AvatarFallback>
              {committee.name
                .split(' ')
                .map((n: any) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between'>
              <p className='font-medium truncate'>{committee.name}</p>
              {!showMemberCount && (
                <span className='text-xs opacity-60'>Committee</span>
              )}
            </div>
            <p className='text-sm opacity-75'>
              {committee.memberCount} members • {committee.lastActivity}
            </p>
          </div>
          {committee.unreadCount > 0 && (
            <div className='bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
              {committee.unreadCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

