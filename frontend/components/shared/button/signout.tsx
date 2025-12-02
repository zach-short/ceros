import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export function SignoutButton({ className }: { className?: string }) {
  const handleSignOut = async () => {
    await signOut({ redirect: false });

    window.location.href = '/';
  };

  return (
    <Button
      onClick={handleSignOut}
      className={`w-full mx-auto ${className}`}
      variant='outline'
    >
      Sign out
    </Button>
  );
}
