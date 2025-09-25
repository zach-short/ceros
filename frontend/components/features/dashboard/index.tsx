'use client';
import { useSession } from 'next-auth/react';
import { AdminOnly, AuthGate, MemberOnly } from '@/components/auth/auth-gate';

export default function Dashboard() {
  const session = useSession();
  return (
    <AuthGate>
      <div className='p-6 space-y-4'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <p>Hello {session.data?.user?.name || session.data?.user?.email}</p>

        <p>This is visible to all logged-in users.</p>

        <MemberOnly
          fallback={<div className='text-red-500'>Member access required</div>}
        >
          <p>This is visible to members and admins only.</p>
        </MemberOnly>

        <AdminOnly
          fallback={<div className='text-red-500'>Admin access required</div>}
        >
          <p>This is visible to admins only.</p>
        </AdminOnly>
      </div>
    </AuthGate>
  );
}
