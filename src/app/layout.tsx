'use client';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';

const metadata: Metadata = {
  title: 'Pool Parser Pro',
  description: 'Gerencie suas posições de LP da Uniswap com facilidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('font-body antialiased', 'min-h-screen w-full bg-background')}
      >
        <div className="flex flex-col">
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
