import { Menu, Sun, Bell } from 'lucide-react';
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleNewPool = () => {
    router.push('/pools/new');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <NextLink href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold">PoolTracker</h1>
        </NextLink>
      </div>
       <Button onClick={handleNewPool}>
          Nova Pool
       </Button>
    </header>
  );
}
