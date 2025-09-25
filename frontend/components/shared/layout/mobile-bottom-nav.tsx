'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  MessagesSquareIcon,
  User,
  Users,
  LayoutDashboard,
  MenuIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  {
    href: '/chat',
    icon: MessagesSquareIcon,
    label: 'Messages',
  },
  {
    href: '/friends',
    icon: Users,
    label: 'Friends',
  },
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profile',
  },
  {
    href: '/menu',
    icon: MenuIcon,
    label: 'Menu',
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/chat') {
      return pathname === '/chat' || pathname.startsWith('/committees/');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-background border-t border-border lg:hidden z-50'>
      <div className='flex items-center justify-around h-16 px-2'>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon
                size={20}
                className={active ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className='text-xs font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

