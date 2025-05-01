'use client';

import Link from 'next/link';
import { Home, Puzzle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4"> {/* Increased height, max-width, added padding */}
        {/* Logo/Title Section - Updated Link href */}
        <Link href="/home" className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors">
           <Puzzle className="h-6 w-6 text-primary" />
           <span>RiddleMeThis</span>
        </Link>

        {/* Navigation Section */}
        <nav className="flex items-center space-x-2 sm:space-x-4"> {/* Reduced spacing slightly */}
          <Link href="/home" passHref>
             <Button
                variant="ghost"
                className={cn(
                  'transition-colors px-3 py-2 text-sm font-medium', // Adjusted padding and size
                  isActive('/home')
                    ? 'bg-accent text-accent-foreground' // Use accent for active background
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50' // Muted for inactive, subtle hover
                )}
             >
                <Home className="mr-1.5 h-4 w-4" /> {/* Adjusted icon margin */}
                Home
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button
                 variant="ghost"
                 className={cn(
                   'transition-colors px-3 py-2 text-sm font-medium', // Adjusted padding and size
                   isActive('/')
                     ? 'bg-accent text-accent-foreground' // Use accent for active background
                     : 'text-muted-foreground hover:text-foreground hover:bg-accent/50' // Muted for inactive, subtle hover
                 )}
             >
              <Puzzle className="mr-1.5 h-4 w-4" /> {/* Adjusted icon margin */}
              Game
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
