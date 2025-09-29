'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessagesSquareIcon, User, Users, MenuIcon, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { NotificationBadge } from '../notification-badge';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/chat',
    icon: MessagesSquareIcon,
    label: 'Messages',
  },
  {
    href: '/notifications',
    icon: Bell,
    label: 'Notifications',
    showBadge: true,
  },
  {
    href: '/friends',
    icon: Users,
    label: 'Friends',
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
  const session = useSession();

  const isActive = (href: string) => {
    if (href === '/chat') {
      return pathname === '/chat' || pathname.startsWith('/committees/');
    }
    if (href === '/notifications') {
      return pathname === '/notifications';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (!session) {
    return null;
  }

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
              <div className='relative'>
                <item.icon
                  size={20}
                  className={active ? 'text-primary' : 'text-muted-foreground'}
                />
                {item.showBadge && (
                  <NotificationBadge className='absolute -top-2 -right-2 min-w-[16px] h-4 text-[10px] px-1' />
                )}
              </div>
              <span className='text-xs font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
