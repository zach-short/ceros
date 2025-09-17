import { useFetch, useMutation } from '../use-fetch';
import { usersApi, User } from '@/lib/api/users';

export function useUser() {
  return useFetch<User>(usersApi.getMe);
}

export function usePublicProfile(userId: string) {
  return useFetch<User>(usersApi.getPublicProfile, {
    resourceParams: [userId],
  });
}

export function useUpdateProfile(options?: {
  onSuccess?: (data: User) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(usersApi.updateProfile, {
    onSuccess: (data: User) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useCheckUsername(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(usersApi.checkUsername, {
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
