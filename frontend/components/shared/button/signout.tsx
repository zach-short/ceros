import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export function SignoutButton({ className }: { className?: string }) {
  const handleSignOut = async () => {
    // Sign out without redirect first to clear session
    await signOut({ redirect: false });

    // Then manually redirect to avoid race conditions
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
