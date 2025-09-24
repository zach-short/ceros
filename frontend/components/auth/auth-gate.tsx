'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { CenteredDiv } from '../shared/layout/centered-div';
import { DefaultLoader } from '../shared/layout/loader';
import { UserRole } from '@/models';

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGate({
  children,
  fallback = null,
  redirectTo = '/',
  requireAuth = true,
}: AuthGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (requireAuth && !session) {
      router.push(redirectTo);
    }
  }, [session, status, requireAuth, redirectTo, router]);

  if (status === 'loading') {
    return (
      <CenteredDiv>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (requireAuth && !session) {
    return fallback;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  userRole?: UserRole;
}

export function RoleGate({
  children,
  allowedRoles,
  fallback = <div>Access denied</div>,
  userRole = 'observer',
}: RoleGateProps) {
  const { data: session } = useSession();

  if (!session) {
    return fallback;
  }

  const currentRole = userRole;

  if (!allowedRoles.includes(currentRole)) {
    return fallback;
  }

  return <>{children}</>;
}

export function AdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGate allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function MemberOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGate allowedRoles={['admin', 'member']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
