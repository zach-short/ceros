'use client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NotificationItem } from './notification-item';

interface NotificationSectionProps {
  title: string;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    created_at?: string;
    timestamp?: string;
    read: boolean;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    urgency: 'low' | 'medium' | 'high';
    href?: string;
  }>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function NotificationSection({
  title,
  notifications,
  isCollapsed,
  onToggleCollapse,
}: NotificationSectionProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <button
        onClick={onToggleCollapse}
        className='flex items-center gap-2 text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors'
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        {title}
        <span className='text-sm text-muted-foreground'>
          ({unreadCount} unread)
        </span>
      </button>
      {!isCollapsed && (
        <div className='space-y-2 ml-6'>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
