'use client';

import { Crown, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  isOnline: boolean;
}

interface MemberListItemProps {
  member: Member;
}

export function MemberListItem({ member }: MemberListItemProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Chair':
        return <Crown size={16} className="text-yellow-500" />;
      case 'Vice Chair':
        return <UserCheck size={16} className="text-blue-500" />;
      case 'Secretary':
        return <UserCheck size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer ${!member.isOnline ? 'opacity-60' : ''}`}>
      <div className="relative">
        <Avatar>
          <AvatarImage src={member.image || undefined} />
          <AvatarFallback>
            {member.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-background rounded-full ${
          member.isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{member.name}</p>
          {getRoleIcon(member.role)}
        </div>
        <p className="text-sm opacity-75">{member.role}</p>
      </div>
    </div>
  );
}