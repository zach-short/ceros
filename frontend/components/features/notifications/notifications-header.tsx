'use client';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead?: () => void;
}

export function NotificationsHeader({ unreadCount, onMarkAllRead }: NotificationsHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <Bell size={28} />
        <h1 className='text-2xl font-bold'>Notifications</h1>
        {unreadCount > 0 && (
          <span className='bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full'>
            {unreadCount}
          </span>
        )}
      </div>
      {unreadCount > 0 && onMarkAllRead && (
        <Button variant="outline" size="sm" onClick={onMarkAllRead}>
          <Check size={16} className='mr-2' />
          Mark All Read
        </Button>
      )}
    </div>
  );
}