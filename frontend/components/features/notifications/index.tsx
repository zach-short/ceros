'use client';

import {
  useNotifications,
  useNotificationActions,
} from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { data, error, isLoading, mutate } = useNotifications();
  const { markNotificationRead, dismissNotification, markAllRead } =
    useNotificationActions();
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    setActingOnId(notificationId);
    try {
      await markNotificationRead(notificationId);
      mutate();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setActingOnId(null);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    setActingOnId(notificationId);
    try {
      await dismissNotification(notificationId);
      mutate();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    } finally {
      setActingOnId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      mutate();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
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

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center space-x-2 mb-6'>
          <Bell className='w-6 h-6' />
          <h1 className='text-2xl font-bold'>Notifications</h1>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardContent className='p-4'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>
            Error Loading Notifications
          </h1>
          <p className='text-gray-600'>
            Failed to load notifications. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-2'>
          <Bell className='w-6 h-6' />
          <h1 className='text-2xl font-bold'>Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant='destructive' className='ml-2'>
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant='outline'
            size='sm'
            className='flex items-center space-x-2'
          >
            <CheckCheck className='w-4 h-4' />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center'>
            <Bell className='w-12 h-12 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No notifications
            </h3>
            <p className='text-gray-500'>
              You&apos;re all caught up! Check back later for new notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 ${
                !notification.read
                  ? 'bg-blue-50 border-blue-200 shadow-md'
                  : 'bg-white hover:shadow-md'
              }`}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <CardTitle className='text-lg'>
                        {notification.title}
                      </CardTitle>
                      {!notification.read && (
                        <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                      )}
                      <Badge
                        variant='outline'
                        className={getUrgencyColor(notification.urgency)}
                      >
                        {notification.urgency}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>
                      {notification.message}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className='flex space-x-2 ml-4'>
                    {!notification.read && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant='outline'
                        size='sm'
                        disabled={actingOnId === notification.id}
                        className='flex items-center space-x-1'
                      >
                        <Check className='w-3 h-3' />
                        <span>Mark read</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDismiss(notification.id)}
                      variant='outline'
                      size='sm'
                      disabled={actingOnId === notification.id}
                      className='flex items-center space-x-1 text-red-600 hover:text-red-700'
                    >
                      <X className='w-3 h-3' />
                      <span>Dismiss</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {notification.href && (
                <CardContent className='pt-0'>
                  <Button
                    asChild
                    variant='link'
                    className='p-0 h-auto text-blue-600 hover:text-blue-700'
                  >
                    <a href={notification.href}>View details →</a>
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
