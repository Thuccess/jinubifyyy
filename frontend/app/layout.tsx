import React from 'react';
import type { Metadata } from 'next';
import '../src/index.css';
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  icons: {
    icon: '/logo/logo-light.png',
    shortcut: '/logo/logo-light.png',
    apple: '/logo/logo-light.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

