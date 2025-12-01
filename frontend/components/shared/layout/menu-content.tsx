'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessagesSquareIcon,
  User,
  Users,
  Settings,
  Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignoutButton } from '../button/signout';
import { useUser } from '@/hooks/api/use-users';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Messages', href: '/', icon: MessagesSquareIcon },
  { title: 'Friends', href: '/friends', icon: Users },
  { title: 'Profile', href: '/profile', icon: User },
  { title: 'Settings', href: '/profile/settings', icon: Settings },
  { title: 'Create Committee', href: '/committees/new', icon: Plus },
];

function ProfileCard() {
  const session = useSession();
  const { data: userData } = useUser();
  const sessionUser = session.data?.user;

  const displayName = userData?.name || sessionUser?.name;
  const displayEmail = userData?.email || sessionUser?.email;
  const displayPicture = userData?.picture;

  return (
    <Link
      href={`/profile/${sessionUser?.id}`}
      className={`flex flex-row items-center`}
    >
      <Avatar>
        <AvatarImage src={displayPicture || undefined} />
        <AvatarFallback>
          {displayName?.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col items-start ml-3`}>
        <p>{displayName}</p>
        <p className={`text-xs`}>{displayEmail}</p>
      </div>
    </Link>
  );
}

function MenuItem({
  href,
  title,
  icon: Icon,
  onClick,
  isActive = false,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <Link
      className={cn(
        'py-1 flex items-center gap-3 relative transition-colors rounded-md px-2 py-2',
        isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted',
      )}
      href={href}
      onClick={onClick}
    >
      <div className='relative'>
        <Icon size={20} />
      </div>
      {title}
    </Link>
  );
}

interface MenuContentProps {
  onItemClick?: () => void;
  className?: string;
}

export function MenuContent({ onItemClick, className = '' }: MenuContentProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return (
        pathname === '/' ||
        pathname.startsWith('/chat/') ||
        (pathname.startsWith('/committees/') &&
          !pathname.includes('/profile') &&
          !pathname.includes('/members') &&
          !pathname.includes('/motions') &&
          !pathname.includes('/motion'))
      );
    }
    if (href === '/profile') {
      return (
        pathname === '/profile' ||
        (pathname.startsWith('/profile/') &&
          !pathname.startsWith('/profile/settings'))
      );
    }
    if (href === '/profile/settings') {
      return pathname.startsWith('/profile/settings');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <ProfileCard />
      <div className='flex flex-col overflow-y-auto mt-4 flex-1'>
        {menuItems.map((menuItem) => (
          <MenuItem
            title={menuItem.title}
            key={menuItem.href}
            href={menuItem.href}
            icon={menuItem.icon}
            onClick={onItemClick}
            isActive={isActive(menuItem.href)}
          />
        ))}
      </div>
      <SignoutButton className={`mb-12`} />
    </div>
  );
}
