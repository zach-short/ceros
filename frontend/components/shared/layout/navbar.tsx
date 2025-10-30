'use client';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { MenuIcon, Home } from 'lucide-react';
import { useState } from 'react';
import { MenuContent } from './menu-content';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar({
  buttonClassName,
  contentClassName,
}: {
  buttonClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session && pathname !== '/') {
    return (
      <Link
        href='/'
        className={`fixed lg:absolute top-4 lg:top-6 right-4 lg:right-6 z-50 text-neutral-400 hover:text-white transition-colors ${buttonClassName}`}
      >
        <Home className={`text-blue-500`} strokeWidth={2} size={32} />
      </Link>
    );
  }

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger
        asChild
        className={`hidden lg:block absolute lg:top-6 right-6 z-50 ${buttonClassName}`}
      >
        <button>
          <MenuIcon size={32} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={`flex flex-col mr-6 mt-[-12] lg:mt-[-4] lg:w-72 w-[calc(100vw-3rem)] px-6 lg:px-4 h-[calc(100vh-6rem)] sm:h-128 ${contentClassName}`}
        onClick={() => setOpen(!open)}
      >
        <MenuContent onItemClick={() => setOpen(false)} className='h-full' />
      </PopoverContent>
    </Popover>
  );
}
