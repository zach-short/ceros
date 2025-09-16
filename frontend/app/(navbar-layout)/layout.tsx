import { Navbar } from '@/components/shared/layout/navbar';
import { ReactNode } from 'react';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
