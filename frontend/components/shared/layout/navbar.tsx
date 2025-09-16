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

function ProfileCard() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <div className={`flex flex-row items-center`}>
      <Avatar>
        <AvatarImage src={user?.image as string | undefined} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className={`flex flex-col items-start ml-3`}>
        <p>{user?.name}</p>
        <p className={`text-xs`}>{user?.email}</p>
      </div>
    </div>
  );
}

function MenuItem({ href, title }: { href: string; title: string }) {
  return (
    <Link className={`mt-2 `} href={href}>
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
  const menuItems = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Comittees', href: '/comittees' },
    { title: 'Friends', href: '/friends' },
  ];

  return (
    <Popover>
      <PopoverTrigger className={`absolute top-10 right-10 ${buttonClassName}`}>
        <MenuIcon size={20} />
      </PopoverTrigger>
      <PopoverContent
        className={`h-120 flex flex-col mr-10 ${contentClassName}`}
      >
        <ProfileCard />
        <div className={`mt-4 flex flex-col`}>
          {menuItems.map((menuItem) => {
            return (
              <MenuItem
                title={menuItem.title}
                key={menuItem.href}
                href={menuItem.href}
              />
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
