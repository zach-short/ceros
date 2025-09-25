'use client';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';
import { MenuContent } from './menu-content';

export function Navbar({
  buttonClassName,
  contentClassName,
}: {
  buttonClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger
        asChild
        className={`hidden lg:block lg:h-0 absolute lg:top-6 right-6 ${buttonClassName}`}
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
