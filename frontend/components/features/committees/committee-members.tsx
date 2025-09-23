'use client';

import { CommitteeHeader } from './committee-header';
import { MemberListSection } from './member-list-section';
import { CommitteeActions } from './committee-actions';

const dummyMembers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Chair',
    image: null,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Vice Chair',
    image: null,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@example.com',
    role: 'Secretary',
    image: null,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Lisa Wilson',
    email: 'lisa@example.com',
    role: 'Member',
    image: null,
    isOnline: true,
  },
  {
    id: '5',
    name: 'Tom Brown',
    email: 'tom@example.com',
    role: 'Member',
    image: null,
    isOnline: false,
  },
  {
    id: '6',
    name: 'Emily Garcia',
    email: 'emily@example.com',
    role: 'Member',
    image: null,
    isOnline: true,
  },
];

export default function CommitteeMembers() {

  const onlineMembers = dummyMembers.filter(member => member.isOnline);
  const offlineMembers = dummyMembers.filter(member => !member.isOnline);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col">
      <CommitteeHeader
        title="Committee Members"
        subtitle={`${dummyMembers.length} members`}
      />

      <div className="flex-1 overflow-y-auto">
        <MemberListSection title="Online" members={onlineMembers} />
        <MemberListSection title="Offline" members={offlineMembers} />
        <CommitteeActions />
      </div>
    </div>
  );
}