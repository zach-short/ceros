import { useState, useCallback, useEffect } from 'react';

interface PaginatedSearchOptions<T> {
  fetchFn: (
    query: string,
    cursor?: string,
    limit?: number
  ) => Promise<{ success: boolean; data: any; error?: any }>;
  pageSize?: number;
  debounceMs?: number;
}

/**
 * Generic hook for paginated search with debouncing
 *
 * @param fetchFn - Function to fetch paginated results
 * @param pageSize - Number of items per page (default: 100)
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Search state and control functions
 */
export function usePaginatedSearch<T>({
  fetchFn,
  pageSize = 100,
  debounceMs = 300,
}: PaginatedSearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(
    async (searchQuery: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchFn(searchQuery, undefined, pageSize);
        if (response.success) {
          setItems(response.data.users || response.data.items || []);
          setCursor(response.data.nextCursor);
          setHasMore(response.data.hasMore);
        } else {
          setError(response.error?.message || 'Failed to load results');
          setItems([]);
        }
      } catch (err) {
        setError('An error occurred while searching');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !cursor) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchFn(query, cursor, pageSize);
      if (response.success) {
        setItems((prev) => [
          ...prev,
          ...(response.data.users || response.data.items || []),
        ]);
        setCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      }
    } catch (err) {
      setError('An error occurred while loading more results');
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFn, query, cursor, hasMore, isLoadingMore, pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        loadInitial(query);
      } else {
        setItems([]);
        setCursor(undefined);
        setHasMore(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, loadInitial]);

  return {
    query,
    setQuery,
    items,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    error,
  };
}
