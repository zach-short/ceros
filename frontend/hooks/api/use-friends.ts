import { useFetch, useMutation } from '../use-fetch';
import { friendsApi } from '@/lib/api/friends';

export function useFriends() {
  return useFetch(friendsApi.getAll);
}

export function usePendingRequests() {
  return useFetch(friendsApi.getPending);
}

export function useSentRequests() {
  return useFetch(friendsApi.getSent);
}

export function useFriendship(friendshipId: string | undefined) {
  return useFetch(friendsApi.getFriendship, {
    resourceParams: [friendshipId],
    dependencies: [friendshipId],
    enabled: !!friendshipId,
  });
}

export function useRequestFriend(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation(friendsApi.requestFriend, {
    onSuccess: (data) => {
      console.log('Friend request sent:', data);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to send friend request:', error);
      options?.onError?.(error);
    },
  });
}

export function useAcceptFriend(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation(friendsApi.acceptFriend, {
    onSuccess: (data) => {
      console.log('Friend request accepted:', data);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to accept friend request:', error);
      options?.onError?.(error);
    },
  });
}

export function useRejectFriend(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation(friendsApi.rejectFriend, {
    onSuccess: (data) => {
      console.log('Friend request rejected:', data);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to reject friend request:', error);
      options?.onError?.(error);
    },
  });
}

export function useRemoveFriend(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation(friendsApi.removeFriend, {
    onSuccess: (data) => {
      console.log('Friend removed:', data);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to remove friend:', error);
      options?.onError?.(error);
    },
  });
}

export function useBlockUser(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation(friendsApi.blockUser, {
    onSuccess: (data) => {
      console.log('User blocked:', data);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to block user:', error);
      options?.onError?.(error);
    },
  });
}

export function useUnblockUser(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation(friendsApi.unblockUser, {
    onSuccess: (data) => {
      console.log('User unblocked:', data);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to unblock user:', error);
      options?.onError?.(error);
    },
  });
}

