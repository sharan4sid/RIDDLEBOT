'use client';

import Link from 'next/link';
import { Home, Puzzle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/home" passHref>
             <Button
                variant={pathname === '/home' ? 'secondary' : 'ghost'}
                className={cn(
                  'transition-colors',
                  pathname === '/home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
             >
                <Home className="mr-2 h-4 w-4" />
                Home
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button
                variant={pathname === '/' ? 'secondary' : 'ghost'}
                className={cn(
                  'transition-colors',
                  pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
             >
              <Puzzle className="mr-2 h-4 w-4" />
              Riddle Game
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
