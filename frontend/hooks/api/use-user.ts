import { useApiQuery, useApiMutation } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  role: 'admin' | 'member' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  image?: string;
}

export function useUserProfile() {
  return useApiQuery<UserProfile>('/api/user/profile', {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  });
}

export function useUpdateProfile() {
  return useApiMutation<UserProfile, UpdateProfileRequest>({
    onSuccess: () => {
      // Profile will be revalidated automatically
    },
  });
}

export function useDeleteAccount() {
  return useApiMutation<void, void>({
    onSuccess: () => {
      // Handle account deletion success (e.g., redirect to sign out)
    },
  });
}