import React from 'react';
import type { Metadata } from 'next';
import '../src/index.css';
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="H1NRjzvzNN7Wy7kezBBMkcLVua2cH83EeGlCgnfzGaA" />
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        {/* Larger PNG logo that search engines can also pick up as a favicon */}
        <link rel="icon" href="/search-engine-logo.png" sizes="192x192" type="image/png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

