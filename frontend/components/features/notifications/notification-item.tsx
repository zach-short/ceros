'use client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useNotificationActions } from '@/lib/api/notifications';
import {
  Settings,
  Users,
  FileText,
  Vote,
  UserCircle,
  Bell,
} from 'lucide-react';

interface NotificationItemProps {
  notification: {
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
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markNotificationRead } = useNotificationActions();

  const {
    id,
    title,
    message,
    created_at,
    timestamp,
    read,
    type,
    urgency,
    href,
  } = notification;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'motion':
        return FileText;
      case 'vote':
        return Vote;
      case 'meeting':
        return Users;
      case 'system':
        return Settings;
      default:
        return Bell;
    }
  };

  const Icon = notification.icon || getIconForType(type);

  const displayTimestamp = created_at
    ? new Date(created_at).toLocaleDateString()
    : timestamp || 'now';

  const handleClick = async () => {
    if (!read) {
      try {
        await markNotificationRead(id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    if (href) {
      window.location.href = href;
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'motion':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'vote':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'meeting':
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20';
      case 'system':
        return 'bg-muted border-border';
      default:
        return 'bg-muted border-border';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Normal';
      case 'low':
        return 'Low';
      default:
        return 'Normal';
    }
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        'p-4 border rounded-lg transition-colors',
        href || !read ? 'cursor-pointer hover:bg-muted/50' : '',
        read ? 'border-border' : 'bg-accent/50 border-accent',
        notification.id === 'account-setup' ? 'mb-2' : '',
      )}
    >
      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'flex-shrink-0 p-2 rounded-full',
            read ? 'bg-muted' : 'bg-accent',
          )}
        >
          <Icon
            size={18}
            className={cn(
              read ? 'text-muted-foreground' : 'text-accent-foreground',
            )}
          />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h4
              className={cn(
                'font-medium truncate',
                read ? 'text-foreground' : 'text-foreground font-semibold',
              )}
            >
              {title}
            </h4>
            <Badge
              variant='secondary'
              className={cn('text-xs border', getUrgencyBadgeColor(urgency))}
            >
              {getUrgencyLabel(urgency)}
            </Badge>
            <Badge
              variant='secondary'
              className={cn('text-xs border', getTypeBadgeColor(type))}
            >
              {type}
            </Badge>
            {!read && (
              <div className='w-2 h-2 bg-primary rounded-full flex-shrink-0' />
            )}
          </div>

          <p
            className={cn(
              'text-sm mb-2',
              read ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {message}
          </p>

          <p className='text-xs text-muted-foreground'>{displayTimestamp}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
