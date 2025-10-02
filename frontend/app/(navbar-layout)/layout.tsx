import { Navbar } from '@/components/shared/layout/navbar';
import { MobileBottomNav } from '@/components/shared/layout/mobile-bottom-nav';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { ReactNode } from 'react';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <Navbar />
      {children}
      <MobileBottomNav />
    </NotificationProvider>
  );
}
