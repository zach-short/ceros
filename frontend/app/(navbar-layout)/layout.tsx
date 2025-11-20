import { Navbar } from '@/components/shared/layout/navbar';
import { MobileBottomNav } from '@/components/shared/layout/mobile-bottom-nav';
import { ReactNode } from 'react';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <MobileBottomNav />
    </>
  );
}
