import { useSession, signOut } from 'next-auth/react';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      // Handle 401 errors by signing out the user
      if (response.status === 401) {
        try {
          await signOut({ redirect: false });
          toast.info('Your session has expired. Please sign in again.');
        } catch (signOutError) {
          console.error('Error signing out user:', signOutError);
        }
      }

      const error = new Error(`API Error: ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = await response.json().catch(() => ({}));
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  async post<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      token,
    );
  }

  async put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      token,
    );
  }

  async patch<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      token,
    );
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }
}

export const apiClient = new ApiClient();

export function useApiQuery<T>(
  endpoint: string | null,
  config?: SWRConfiguration<T>,
): SWRResponse<T> {
  const { data: session } = useSession();

  const fetcher = async (url: string): Promise<T> => {
    const token =
      (session as any)?.apiToken ||
      (session as any)?.user?.apiToken ||
      (session as any)?.accessToken;
    if (!token) {
      throw new Error('No authentication token available');
    }
    return apiClient.get<T>(url, token);
  };

  const token =
    (session as any)?.apiToken ||
    (session as any)?.user?.apiToken ||
    (session as any)?.accessToken;

  return useSWR(token && endpoint ? endpoint : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    ...config,
  });
}

export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    config?: SWRConfiguration<TData>;
  },
) {
  const { data: session } = useSession();

  const mutationFetcher = async (
    url: string,
    { arg }: { arg: TVariables },
  ): Promise<TData> => {
    const token =
      (session as any)?.apiToken ||
      (session as any)?.user?.apiToken ||
      (session as any)?.accessToken;
    if (!token) {
      throw new Error('No authentication token available');
    }

    switch (method) {
      case 'POST':
        return apiClient.post<TData>(endpoint, arg, token);
      case 'PUT':
        return apiClient.put<TData>(endpoint, arg, token);
      case 'PATCH':
        return apiClient.patch<TData>(endpoint, arg, token);
      case 'DELETE':
        return apiClient.delete<TData>(endpoint, token);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };

  const mutation = (useSWRMutation as any)(endpoint, mutationFetcher, {
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    ...options?.config,
  });

  return {
    ...mutation,
    mutate: mutation.trigger,
  };
}
