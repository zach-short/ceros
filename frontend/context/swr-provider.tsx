'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 60000, // refresh every minute
        revalidateOnFocus: false, // dont revalidate on window focus
        revalidateOnReconnect: true, // revalidate when connection is restored
        dedupingInterval: 5000, // dedupe requests within 5 seconds
        errorRetryCount: 3, // retry failed requests 3 times
        errorRetryInterval: 5000, // wait 5 seconds between retries
        onError: (error) => console.error('SWR Error:', error),
        onSuccess: (data, key) => console.log(`SWR Success for ${key}:`, data),
      }}
    >
      {children}
    </SWRConfig>
  );
}

