import { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`!select-none lg:h-screen h-[calc(100vh-4rem)]`}>
      {children}
    </div>
  );
}
