import { Navbar } from '@/components/shared/layout/navbar';
import { MobileBottomNav } from '@/components/shared/layout/mobile-bottom-nav';
import { ReactNode } from 'react';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className={`pb-16 lg:pb-0`}>{children}</div>
      <MobileBottomNav />
    </>
  );
}
