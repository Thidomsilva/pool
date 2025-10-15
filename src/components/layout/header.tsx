import { Database } from 'lucide-react';
import NextLink from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <NextLink href="/dashboard" className="flex items-center gap-2">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Pool Parser Pro</h1>
      </NextLink>
    </header>
  );
}
