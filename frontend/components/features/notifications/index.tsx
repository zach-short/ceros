'use client';
import { useSession } from 'next-auth/react';
import { AuthGate } from '@/components/auth/auth-gate';
import { NotificationsHeader } from './notifications-header';
import { NotificationSection } from './notification-section';
import { CommitteeSection } from './committee-section';
import {
  isProfileIncomplete,
  createAccountSetupNotification,
} from './notification-utils';
import {
  useNotifications,
  useNotificationActions,
} from '@/lib/api/notifications';
import { Bell } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Notifications() {
  const session = useSession();
  const { data, error, isLoading } = useNotifications();
  const { markAllRead } = useNotificationActions();
  const [systemCollapsed, setSystemCollapsed] = useState(false);
  const [committeeCollapsed, setCommitteeCollapsed] = useState({});

  const { systemNotifications, committeeNotifications } = useMemo(() => {
    if (!data?.notifications) {
      return { systemNotifications: [], committeeNotifications: [] };
    }

    const profileIncomplete = isProfileIncomplete(session.data?.user);
    const allNotifications = profileIncomplete
      ? [createAccountSetupNotification(), ...data.notifications]
      : data.notifications;

    const systemNotifs = allNotifications.filter((n) => n.type === 'system');

    const committeeNotifs = allNotifications.filter((n) =>
      ['motion', 'vote', 'meeting'].includes(n.type),
    );

    const committeeGroups = [
      {
        committee: 'Recent Activities',
        notifications: committeeNotifs,
      },
    ].filter((group) => group.notifications.length > 0);

    return {
      systemNotifications: systemNotifs,
      committeeNotifications: committeeGroups,
    };
  }, [data?.notifications, session.data?.user]);

  const toggleCommitteeCollapse = (committee: string) => {
    setCommitteeCollapsed((prev) => ({
      ...prev,
      [committee]: !prev[committee],
    }));
  };

  const unreadCount = [
    ...systemNotifications,
    ...committeeNotifications.flatMap((c) => c.notifications),
  ].filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <AuthGate>
        <div className='p-6 space-y-6'>
          <div className='flex items-center gap-3'>
            <Bell size={28} />
            <h1 className='text-2xl font-bold'>Notifications</h1>
          </div>
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>Loading notifications...</p>
          </div>
        </div>
      </AuthGate>
    );
  }

  if (error) {
    return (
      <AuthGate>
        <div className='p-6 space-y-6'>
          <div className='flex items-center gap-3'>
            <Bell size={28} />
            <h1 className='text-2xl font-bold'>Notifications</h1>
          </div>
          <div className='text-center py-12'>
            <p className='text-destructive'>Failed to load notifications</p>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className='p-6 space-y-6'>
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
        />

        <NotificationSection
          title='System Notifications'
          notifications={systemNotifications}
          isCollapsed={systemCollapsed}
          onToggleCollapse={() => setSystemCollapsed(!systemCollapsed)}
        />

        <CommitteeSection
          committees={committeeNotifications}
          isMainCollapsed={committeeCollapsed._all || false}
          committeeCollapsed={committeeCollapsed}
          onToggleMainCollapse={() =>
            setCommitteeCollapsed((prev) => ({ ...prev, _all: !prev._all }))
          }
          onToggleCommitteeCollapse={toggleCommitteeCollapse}
        />

        {systemNotifications.length === 0 &&
          committeeNotifications.length === 0 && (
            <div className='text-center py-12'>
              <Bell size={48} className='mx-auto text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>No notifications yet</p>
            </div>
          )}
      </div>
    </AuthGate>
  );
}
