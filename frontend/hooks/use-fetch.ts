import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    message: string;
    data?: any;
  };
  isOffline?: boolean;
}

interface UseFetchOptions<T> {
  resourceParams?: (string | undefined)[];
  dependencies?: any[];
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseFetchOptions<T> = {},
): UseFetchReturn<T> {
  const {
    resourceParams = [],
    dependencies = [],
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || resourceParams.some((param) => param === undefined)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction(...resourceParams);

      if (response.success) {
        setData(response.data || null);
        onSuccess?.(response.data!);
      } else {
        const errorData = response.error || { message: 'Unknown error' };
        setError(errorData);
        onError?.(errorData);
      }
    } catch (err: any) {
      const errorData = {
        status: err.status || 500,
        message: err.message || 'Network error',
      };
      setError(errorData);
      onError?.(errorData);
    } finally {
      setLoading(false);
    }
  }, [
    apiFunction,
    enabled,
    onSuccess,
    onError,
    ...resourceParams,
    ...dependencies,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: any, variables: V) => void;
}

interface UseMutationReturn<T, V> {
  mutate: (variables: V) => Promise<void>;
  data: T | null;
  loading: boolean;
  error: any;
}

export function useMutation<T, V>(
  apiFunction: (variables: V) => Promise<ApiResponse<T>>,
  options: UseMutationOptions<T, V> = {},
): UseMutationReturn<T, V> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = useCallback(
    async (variables: V) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunction(variables);

        if (response.success) {
          setData(response.data || null);
          onSuccess?.(response.data!, variables);
        } else {
          const errorData = response.error || { message: 'Unknown error' };
          setError(errorData);
          onError?.(errorData, variables);
        }
      } catch (err: any) {
        const errorData = {
          status: err.status || 500,
          message: err.message || 'Network error',
        };
        setError(errorData);
        onError?.(errorData, variables);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError],
  );

  return {
    mutate,
    data,
    loading,
    error,
  };
}

