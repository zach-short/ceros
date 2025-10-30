'use client';

import { useWebSocket } from '@/hooks/use-web-socket';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  urgency: string;
  href?: string;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleNotification = (notification: Notification) => {
    const icon =
      notification.urgency === 'high' ? (
        <AlertCircle className='h-5 w-5 text-red-500' />
      ) : notification.urgency === 'low' ? (
        <CheckCircle className='h-5 w-5 text-green-500' />
      ) : (
        <Info className='h-5 w-5 text-blue-500' />
      );

    toast(notification.title, {
      description: notification.message,
      icon,
      action: notification.href
        ? {
            label: 'View',
            onClick: () => router.push(notification.href!),
          }
        : undefined,
      duration: notification.urgency === 'high' ? 10000 : 5000,
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
        badge: '/icon.png',
      });
    }
  };

  useWebSocket({
    onNotification: handleNotification,
  });

  return <>{children}</>;
}

