import { Menu, Sun, Bell, User } from 'lucide-react';
import NextLink from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </button>
        <NextLink href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold">PoolTracker</h1>
        </NextLink>
      </div>
      <div className="flex items-center gap-2">
        <button>
          <Sun className="h-5 w-5" />
          <span className="sr-only">Alternar tema</span>
        </button>
        <button>
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </button>
        <button className="h-6 w-6 rounded-full bg-muted flex items-center justify-center font-semibold">
          T
        </button>
      </div>
    </header>
  );
}
