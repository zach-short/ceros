'use client';

import { MemberListItem } from './member-list-item';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  isOnline: boolean;
}

interface MemberListSectionProps {
  title: string;
  members: Member[];
}

export function MemberListSection({ title, members }: MemberListSectionProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <h2 className="text-sm font-medium opacity-75 mb-3">
        {title} ({members.length})
      </h2>
      <div className="space-y-3">
        {members.map((member) => (
          <MemberListItem key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}