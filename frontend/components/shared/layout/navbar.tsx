'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { MenuIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SignoutButton } from '../button/signout';
import { useState } from 'react';

function ProfileCard({ onClick }: { onClick?: () => void }) {
  const session = useSession();
  const user = session.data?.user;
  return (
    <Link
      href={`/profile/${user?.id}`}
      className={`flex flex-row items-center`}
      onClick={() => onClick?.()}
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
  onClick,
}: {
  href: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <Link className={`mt-2 `} href={href} onClick={onClick}>
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
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Comittees', href: '/committee' },
    { title: 'Friends', href: '/friends' },
    { title: 'Profile', href: '/profile' },
  ];

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger
        className={`h-20 lg:h-0 absolute top-1 lg:top-6 right-6 lg:block ${buttonClassName}`}
      >
        <MenuIcon size={32} />
      </PopoverTrigger>
      <PopoverContent
        className={`h-120 flex flex-col mr-10 ${contentClassName}`}
      >
        <ProfileCard onClick={() => setOpen(!open)} />
        <div className={`mt-4 flex flex-col`}>
          {menuItems.map((menuItem) => {
            return (
              <MenuItem
                onClick={() => setOpen(!open)}
                title={menuItem.title}
                key={menuItem.href}
                href={menuItem.href}
              />
            );
          })}
        </div>

        <SignoutButton className={`absolute bottom-10 w-3/4 ml-1`} />
      </PopoverContent>
    </Popover>
  );
}
