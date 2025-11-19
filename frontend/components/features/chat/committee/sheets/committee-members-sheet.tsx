'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OnlineStatusIndicator } from '@/components/shared/user/online-status-indicator';
import { User } from '../../ui/types';
import { Committee } from '@/models/committee';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';

interface CommitteeMembersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: User[];
  committee: Committee | null;
}

interface MemberWithRole extends User {
  role: 'Owner' | 'Chair' | 'Member' | 'Observer';
}

function MemberCard({ member }: { member: MemberWithRole }) {
  return (
    <div className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer'>
      <div className='relative'>
        <Avatar>
          <AvatarImage src={member.picture || undefined} />
          <AvatarFallback>
            {member.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className='absolute -bottom-1 -right-1'>
          <OnlineStatusIndicator isOnline={false} size='sm' />
        </div>
      </div>
      <div className='flex-1 min-w-0'>
        <p className='font-medium truncate'>{member.name}</p>
        <p className='text-sm opacity-60 truncate'>{member.email}</p>
      </div>
      <div className='text-xs opacity-60 font-medium'>{member.role}</div>
    </div>
  );
}

export function CommitteeMembersSheet({
  open,
  onOpenChange,
  members,
  committee,
}: CommitteeMembersSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const side = isDesktop ? 'right' : 'bottom';

  const categorizeMembers = () => {
    if (!committee)
      return { owner: null, chair: null, members: [], observers: [] };

    const owner = members.find((m) => m.id === committee.ownerId);
    const chair = members.find((m) => m.id === committee.chairId);
    const regularMembers = members.filter(
      (m) =>
        committee.memberIds?.includes(m.id) &&
        m.id !== committee.ownerId &&
        m.id !== committee.chairId,
    );
    const observers = members.filter((m) =>
      committee.observerIds?.includes(m.id),
    );

    return {
      owner: owner ? { ...owner, role: 'Owner' as const } : null,
      chair: chair ? { ...chair, role: 'Chair' as const } : null,
      members: regularMembers.map((m) => ({ ...m, role: 'Member' as const })),
      observers: observers.map((m) => ({ ...m, role: 'Observer' as const })),
    };
  };

  const {
    owner,
    chair,
    members: regularMembers,
    observers,
  } = categorizeMembers();

  const memberCount = (chair ? 1 : 0) + regularMembers.length;
  const observerCount = observers.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{committee?.name || 'Committee'} Members</SheetTitle>
          <SheetDescription>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
            {observerCount > 0 &&
              ` • ${observerCount} observer${observerCount !== 1 ? 's' : ''}`}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto -mx-4 px-4'>
          <div className='space-y-4 pb-4'>
            {owner && (
              <div>
                <h3 className='text-xs font-semibold uppercase opacity-60 mb-2 px-3'>
                  Owner
                </h3>
                <Link href={`/profile/${owner?.id}`} className='flex-1'>
                  <MemberCard member={owner} />
                </Link>
              </div>
            )}

            {chair && (
              <div>
                <h3 className='text-xs font-semibold uppercase opacity-60 mb-2 px-3'>
                  Chair
                </h3>
                <Link href={`/profile/${chair?.id}`} className='flex-1'>
                  <MemberCard member={chair} />
                </Link>
              </div>
            )}

            {regularMembers.length > 0 && (
              <div>
                <h3 className='text-xs font-semibold uppercase opacity-60 mb-2 px-3'>
                  Members ({regularMembers.length})
                </h3>
                <div className='space-y-1'>
                  {regularMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member?.id}`}
                      className='flex-1'
                    >
                      <MemberCard key={member.id} member={member} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {observers.length > 0 && (
              <div>
                <h3 className='text-xs font-semibold uppercase opacity-60 mb-2 px-3'>
                  Observers ({observers.length})
                </h3>
                <div className='space-y-1'>
                  {observers.map((observer) => (
                    <MemberCard key={observer.id} member={observer} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
