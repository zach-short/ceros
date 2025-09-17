'use client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    urgency: 'low' | 'medium' | 'high';
    href?: string;
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const {
    title,
    message,
    timestamp,
    read,
    icon: Icon,
    type,
    urgency,
    href,
  } = notification;

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'motion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vote':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      className={cn(
        'p-4 border rounded-lg transition-colors',
        href ? 'cursor-pointer hover:bg-gray-50' : '',
        read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200',
        notification.id === 'account-setup' ? 'mb-2' : '',
      )}
    >
      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'flex-shrink-0 p-2 rounded-full',
            read ? 'bg-gray-100' : 'bg-blue-100',
          )}
        >
          <Icon
            size={18}
            className={cn(read ? 'text-gray-600' : 'text-blue-600')}
          />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h4
              className={cn(
                'font-medium truncate',
                read ? 'text-gray-900' : 'text-gray-900 font-semibold',
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
              <div className='w-2 h-2 bg-blue-600 rounded-full flex-shrink-0' />
            )}
          </div>

          <p
            className={cn(
              'text-sm mb-2',
              read ? 'text-gray-600' : 'text-gray-700',
            )}
          >
            {message}
          </p>

          <p className='text-xs text-gray-500'>{timestamp}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

