import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SWRProvider } from '@/context/swr-provider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Ceros',
  description: 'A progressive web application',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ceros',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <html lang='en' suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider>
              <SWRProvider>{children}</SWRProvider>
            </SessionProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </>
  );
}
