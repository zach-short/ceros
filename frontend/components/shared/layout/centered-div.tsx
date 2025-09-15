import { ReactNode } from 'react';

export function CenteredDiv({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center h-[100vh] ${className}`}>
      {children}
    </div>
  );
}
