'use client';

import { useUnreadNotificationCount } from '@/lib/api/notifications';

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const { unreadCount, isLoading } = useUnreadNotificationCount();

  if (isLoading || unreadCount === 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}