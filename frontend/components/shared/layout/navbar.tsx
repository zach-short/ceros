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
    { title: 'Comittees', href: '/committee' },
    { title: 'Friends', href: '/friends' },
    { title: 'Profile', href: '/profile' },
  ];

  return (
    <Popover>
      <PopoverTrigger
        className={`h-20 lg:h-0 absolute top-1 lg:top-6 right-6 lg:block ${buttonClassName}`}
      >
        <MenuIcon size={32} />
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

        <SignoutButton className={`absolute bottom-10 w-3/4 ml-1`} />
      </PopoverContent>
    </Popover>
  );
}
