import { useApiQuery, useApiMutation, apiClient } from '../api-client';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  href?: string;
  created_by: string;
  created_at: string;
  expires_at?: string;
  read: boolean;
  read_at?: string;
  dismissed: boolean;
  dismissed_at?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface CreateNotificationRequest {
  type: string;
  title: string;
  message: string;
  urgency?: 'low' | 'medium' | 'high';
  href?: string;
  recipients: string[];
  expires_at?: string;
}

export function useNotifications() {
  return useApiQuery<NotificationsResponse>('/users/me/notifications', {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
}

export function useMarkAllNotificationsRead() {
  return useApiMutation<{ message: string; count: number }, void>(
    '/users/me/notifications/mark-all-read',
    'PATCH',
    {
      onSuccess: () => {
        mutate('/users/me/notifications');
      },
    },
  );
}

export function useCreateNotification() {
  return useApiMutation<
    { message: string; notification: Notification },
    CreateNotificationRequest
  >('/users/me/notifications', 'POST');
}

export function useNotificationActions() {
  const { data: session } = useSession();

  const markNotificationRead = async (notificationId: string) => {
    const token =
      (session as any)?.apiToken ||
      (session as any)?.user?.apiToken ||
      (session as any)?.accessToken;
    if (!token) throw new Error('No authentication token available');

    try {
      await apiClient.patch(
        `/users/me/notifications/${notificationId}/read`,
        {},
        token,
      );
      mutate('/users/me/notifications');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const dismissNotification = async (notificationId: string) => {
    const token =
      (session as any)?.apiToken ||
      (session as any)?.user?.apiToken ||
      (session as any)?.accessToken;
    if (!token) throw new Error('No authentication token available');

    try {
      await apiClient.delete(
        `/users/me/notifications/${notificationId}`,
        token,
      );
      mutate('/users/me/notifications');
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      throw error;
    }
  };

  const markAllRead = async () => {
    const token =
      (session as any)?.apiToken ||
      (session as any)?.user?.apiToken ||
      (session as any)?.accessToken;
    if (!token) throw new Error('No authentication token available');

    try {
      await apiClient.patch('/users/me/notifications/mark-all-read', {}, token);
      mutate('/users/me/notifications');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  };

  return {
    markNotificationRead,
    dismissNotification,
    markAllRead,
  };
}

