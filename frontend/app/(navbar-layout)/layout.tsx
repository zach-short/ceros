import { Navbar } from '@/components/shared/layout/navbar';
import { ReactNode } from 'react';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className={`pt-12 lg:pt-0`}>{children}</div>
    </>
  );
}
