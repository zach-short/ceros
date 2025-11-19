/**
 * Server-side API utilities for fetching data in server components
 * (e.g., generateMetadata, server components)
 *
 * These functions use direct fetch without client-side session management
 * and should only be used for public endpoints or server-side rendering.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ServerApiOptions {
  cache?: RequestCache;
  revalidate?: number;
  headers?: HeadersInit;
}

async function serverApiRequest<T>(
  endpoint: string,
  options: ServerApiOptions = {},
): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: options.cache || 'no-store',
      next: options.revalidate ? { revalidate: options.revalidate } : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error(`Server API request failed: ${endpoint}`, response.status);
      return null;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error fetching from server API: ${endpoint}`, error);
    return null;
  }
}

export const serverUsersApi = {
  getPublicProfile: (userId: string, options?: ServerApiOptions) =>
    serverApiRequest<{ user: any }>(`/users/${userId}/profile`, options),
};

export const serverCommitteeApi = {
  getOne: (committeeId: string, options?: ServerApiOptions) =>
    serverApiRequest<{ committee: any }>(`/committees/${committeeId}`, options),
};
