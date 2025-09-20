'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  MenuIcon,
  GavelIcon,
  LayoutDashboard,
  Users,
  User,
  FileText,
  Vote,
  History,
  Bell,
  Settings,
  MessagesSquareIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SignoutButton } from '../button/signout';
import { useState } from 'react';

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
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <Link className={`mt-2 flex items-center gap-3`} href={href}>
      <Icon size={20} />
      {title}
    </Link>
  );
}
export function Navbar({
  buttonClassName,
  contentClassName,
}: {
  buttonClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuItems = [
    { title: 'Messages', href: '/chat', icon: MessagesSquareIcon },
    { title: 'Notifications', href: '/notifications', icon: Bell },
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Comittees', href: '/committee', icon: GavelIcon },
    { title: 'Motions', href: '/motions', icon: FileText },
    { title: 'Voting', href: '/voting', icon: Vote },
    { title: 'History', href: '/history', icon: History },
    { title: 'Friends', href: '/friends', icon: Users },
    { title: 'Profile', href: '/profile', icon: User },
    { title: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger
        className={`h-20 lg:h-0 absolute lg:top-6 right-6 lg:block ${buttonClassName}`}
      >
        <MenuIcon size={32} />
      </PopoverTrigger>
      <PopoverContent
        className={`flex flex-col mr-6 mt-[-12] lg:mt-[-4] lg:w-72 w-[calc(100vw-3rem)] px-6 lg:px-4 h-[calc(100vh-6rem)] sm:h-128 ${contentClassName}`}
        onClick={() => setOpen(!open)}
      >
        <ProfileCard />
        <div className={`mt-4 flex flex-col`}>
          {menuItems.map((menuItem) => {
            return (
              <MenuItem
                title={menuItem.title}
                key={menuItem.href}
                href={menuItem.href}
                icon={menuItem.icon}
              />
            );
          })}
        </div>

        <div className={`lg:flex-1 mt-12 lg:mt-0`} />
        <SignoutButton />
      </PopoverContent>
    </Popover>
  );
}
