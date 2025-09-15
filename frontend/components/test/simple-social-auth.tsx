'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SimpleSocialAuth() {
  const handleGoogleAuth = () => {
    console.log('🟢 Simple Google auth test');
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleGitHubAuth = () => {
    console.log('🟠 Simple GitHub auth test');
    signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Simple Social Auth Test</h3>
      <p className="text-sm text-gray-600">
        These buttons use the most basic NextAuth signIn calls.
      </p>

      <div className="space-y-2">
        <Button
          onClick={handleGoogleAuth}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Sign in with Google (Simple)
        </Button>

        <Button
          onClick={handleGitHubAuth}
          className="w-full bg-gray-800 hover:bg-gray-900"
        >
          Sign in with GitHub (Simple)
        </Button>
      </div>
    </div>
  );
}