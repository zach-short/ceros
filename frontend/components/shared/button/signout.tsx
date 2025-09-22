import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export function SignoutButton({ className }: { className?: string }) {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/' })}
      className={`w-full  mx-auto ${className}`}
      variant='outline'
    >
      Sign out
    </Button>
  );
}
