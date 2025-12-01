import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

/**
 * Hook for implementing infinite scroll using IntersectionObserver
 * Triggers onLoadMore when the sentinel element becomes visible
 *
 * @param onLoadMore - Callback function to load more items
 * @param hasMore - Whether there are more items to load
 * @param isLoading - Whether a load operation is currently in progress
 * @param threshold - Distance in pixels from the bottom to trigger load (default: 100px)
 * @returns Ref to attach to the sentinel element at the bottom of the list
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return loadMoreRef;
}
