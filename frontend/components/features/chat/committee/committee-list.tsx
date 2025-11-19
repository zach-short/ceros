'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Committee } from '@/models/committee';
import { getCommitteePicture } from '@/lib/utils/committee-avatar';

interface CommitteeListProps {
  committees: Committee[];
  searchQuery?: string;
}

export function CommitteeList({
  committees,
  searchQuery = '',
}: CommitteeListProps) {
  const router = useRouter();

  const filteredCommittees = searchQuery.trim()
    ? committees.filter((committee) =>
        committee.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : committees;

  const getMemberCount = (committee: Committee) => {
    const chairCount = committee.chairId ? 1 : 0;
    const regularMembersCount = committee.memberIds?.length || 0;
    return chairCount + regularMembersCount;
  };

  return (
    <div className='space-y-2'>
      {filteredCommittees.length !== 0 &&
        filteredCommittees.map((committee) => {
          const memberCount = getMemberCount(committee);
          return (
            <div
              key={committee.id}
              onClick={() => router.push(`/committees/${committee.id}`)}
              className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer'
            >
              <Avatar>
                <AvatarImage src={getCommitteePicture(committee)} />
                <AvatarFallback>
                  {committee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate'>{committee.name}</p>
                <p className='text-sm opacity-60'>
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                  {committee.observerIds?.length > 0 &&
                    ` • ${committee.observerIds.length} observer${committee.observerIds.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
