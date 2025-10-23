'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MessagesSquareIcon, User, Users, Bell, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignoutButton } from '../button/signout';
import { NotificationBadge } from '../notification-badge';
import { useUser } from '@/hooks/api/use-users';

const menuItems = [
  { title: 'Messages', href: '/chat', icon: MessagesSquareIcon },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    showBadge: true,
  },
  { title: 'Friends', href: '/friends', icon: Users },
  { title: 'Profile', href: '/profile', icon: User },
  { title: 'Settings', href: '/profile/settings', icon: Settings },
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
  showBadge = false,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
  showBadge?: boolean;
}) {
  return (
    <Link
      className={`py-1 flex items-center gap-3 relative`}
      href={href}
      onClick={onClick}
    >
      <div className='relative'>
        <Icon size={20} />
        {showBadge && (
          <NotificationBadge className='absolute -top-2 -right-2 min-w-[16px] h-4 text-[10px] px-1' />
        )}
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
            showBadge={menuItem.showBadge}
          />
        ))}
      </div>
      <SignoutButton className={`mb-12`} />
    </div>
  );
}
