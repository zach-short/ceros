'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MessagesSquareIcon, User, Users, Bell, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignoutButton } from '../button/signout';

const menuItems = [
  { title: 'Messages', href: '/chat', icon: MessagesSquareIcon },
  {
    title: 'Notifications',
    href: '/profile/settings/notifications',
    icon: Bell,
  },
  { title: 'Friends', href: '/friends', icon: Users },
  { title: 'Profile', href: '/profile', icon: User },
  { title: 'Settings', href: '/profile/settings', icon: Settings },
];

function ProfileCard() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <Link
      href={`/profile/${user?.id}`}
      className={`flex flex-row items-center`}
    >
      <Avatar>
        <AvatarImage src={user?.image as string | undefined} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className={`flex flex-col items-start ml-3`}>
        <p>{user?.name}</p>
        <p className={`text-xs`}>{user?.email}</p>
      </div>
    </Link>
  );
}

function MenuItem({
  href,
  title,
  icon: Icon,
  onClick,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
}) {
  return (
    <Link
      className={`mt-2 flex items-center gap-3`}
      href={href}
      onClick={onClick}
    >
      <Icon size={20} />
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
      <div className='mt-4 flex flex-col overflow-y-auto flex-1'>
        {menuItems.map((menuItem) => (
          <MenuItem
            title={menuItem.title}
            key={menuItem.href}
            href={menuItem.href}
            icon={menuItem.icon}
            onClick={onItemClick}
          />
        ))}
      </div>
      <div className='mt-4'>
        <SignoutButton />
      </div>
    </div>
  );
}
