import { User } from 'next-auth';
import { UserCircle } from 'lucide-react';

export function isProfileIncomplete(user: User | undefined): boolean {
  if (!user) return true;

  const hasName = user.name && user.name.trim().length > 0;
  const hasImage = user.image && user.image.trim().length > 0;

  return !hasName || !hasImage;
}

export function createAccountSetupNotification() {
  return {
    id: 'account-setup',
    type: 'system',
    title: 'Complete Your Account Setup',
    message:
      'Please complete your profile by adding your name and profile picture.',
    timestamp: 'now',
    read: true,
    icon: UserCircle,
    urgency: 'high' as const,
    href: '/profile',
  };
}

