import { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className={`!select-none h-screen`}>{children}</div>;
}
