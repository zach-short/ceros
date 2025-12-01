import { User } from '@/models/user';

export function getUserDisplayName(user: User | undefined): string {
  if (!user) {
    return 'Unknown User';
  }

  if (user.isDeleted) {
    return '(Deleted User)';
  }

  return user.name || user.givenName || user.email || 'Unknown User';
}
