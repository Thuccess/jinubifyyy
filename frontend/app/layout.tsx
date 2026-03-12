import React from 'react';
import type { Metadata } from 'next';
import '../src/index.css';
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="H1NRjzvzNN7Wy7kezBBMkcLVua2cH83EeGlCgnfzGaA" />
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

