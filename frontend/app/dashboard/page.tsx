'use client';
import { signOut, useSession } from 'next-auth/react';
import { AddFriendsInput } from '@/components/features/friends/add-friends-input';
import { AdminOnly, AuthGate, MemberOnly } from '@/components/auth/auth-gate';
import { Button } from '@/components/ui/button';
import { FriendsListClean } from '@/components/test/friends-list';

export default function DashboardPage() {
  const session = useSession();
  return (
    <AuthGate>
      <div className='p-6 space-y-4'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <p>Hello {session.data?.user?.name || session.data?.user?.email}</p>
        <AddFriendsInput />
        <FriendsListClean />

        <div className='p-4  rounded'>
          <h2 className='text-lg font-semibold'>User Content</h2>
          <p>This is visible to all logged-in users.</p>
        </div>

        <MemberOnly
          fallback={<div className='p-4  rounded'>Member access required</div>}
        >
          <div className='p-4 rounded'>
            <h2 className='text-lg font-semibold'>Member Content</h2>
            <p>This is visible to members and admins only.</p>
          </div>
        </MemberOnly>

        <AdminOnly
          fallback={<div className='p-4 rounded'>Admin access required</div>}
        >
          <div className='p-4 rounded'>
            <h2 className='text-lg font-semibold'>Admin Content</h2>
            <p>This is visible to admins only.</p>
          </div>
        </AdminOnly>

        <Button onClick={() => signOut({ callbackUrl: '/' })} variant='outline'>
          Sign out
        </Button>
      </div>
    </AuthGate>
  );
}
