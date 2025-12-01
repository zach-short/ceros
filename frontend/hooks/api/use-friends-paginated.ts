import { useState, useCallback, useEffect } from 'react';
import { friendsApi } from '@/lib/api/friends';

export interface Friend {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
}

/**
 * Hook for loading friends with pagination support
 * Automatically loads the first page on mount
 *
 * @returns Friends data and pagination controls
 */
export function useFriendsPaginated() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await friendsApi.getAll(undefined, 100);
      if (response.success) {
        const friendUsers =
          response.data.friendships?.map((f: any) => f.user) || [];
        setFriends(friendUsers);
        setCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      } else {
        setError(response.error?.message || 'Failed to load friends');
      }
    } catch (err) {
      setError('An error occurred while loading friends');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !cursor) return;

    setIsLoadingMore(true);
    try {
      const response = await friendsApi.getAll(cursor, 100);
      if (response.success) {
        const friendUsers =
          response.data.friendships?.map((f: any) => f.user) || [];
        setFriends((prev) => [...prev, ...friendUsers]);
        setCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      }
    } catch (err) {
      setError('An error occurred while loading more friends');
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, hasMore, isLoadingMore]);

  const refetch = useCallback(() => {
    setFriends([]);
    setCursor(undefined);
    setHasMore(false);
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    friends,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    error,
    refetch,
  };
}
