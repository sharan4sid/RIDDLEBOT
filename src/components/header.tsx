'use client';

import Link from 'next/link';
import { Home, Puzzle, MessageSquare, BrainCircuit, Info, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signIn, signOut, useSession } from 'next-auth/react';
import Chatbot from '@/components/chatbot';
import PlayerHUD from '@/components/player-hud';
import StatsDashboard from '@/components/stats-dashboard';

export default function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary/5 backdrop-blur supports-[backdrop-filter]:bg-primary/10 shadow-sm">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/home" className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>prahelikā</span>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Link href="/home" passHref>
            <Button variant="ghost" className={cn(
              'transition-colors px-2 sm:px-3 py-2 text-sm font-medium',
              isActive('/home') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}>
              <Home className="mr-1.5 h-4 w-4" /> Home
            </Button>
          </Link>

          <Link href="/" passHref>
            <Button variant="ghost" className={cn(
              'transition-colors px-2 sm:px-3 py-2 text-sm font-medium',
              isActive('/') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}>
              <Puzzle className="mr-1.5 h-4 w-4" /> Game
            </Button>
          </Link>

          <Link href="/about" passHref>
            <Button variant="ghost" className={cn(
              'transition-colors px-2 sm:px-3 py-2 text-sm font-medium',
              isActive('/about') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}>
              <Info className="mr-1.5 h-4 w-4" /> About
            </Button>
          </Link>

          {/* Chatbot */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50" aria-label="Open Chatbot">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle>Chat with RiddleBot</DialogTitle>
                <DialogDescription>Ask to change difficulty (easy, medium, hard) or topic (e.g., animals, science).</DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-0">
                <Chatbot />
              </div>
            </DialogContent>
          </Dialog>

          {/* Stats Dashboard */}
          <StatsDashboard
            trigger={
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50" aria-label="View Stats">
                <BarChart3 className="h-5 w-5" />
              </Button>
            }
          />

          {/* Player HUD — level + streak */}
          <PlayerHUD />

          <ThemeToggleButton />

          {/* Auth Button */}
          {status === 'loading' ? (
            <Button variant="ghost" disabled className="px-2 h-9">...</Button>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 md:ml-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
                    <AvatarFallback>{session.user.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => signIn('google')} className="ml-1 md:ml-2 h-9">
              Sign In
            </Button>
          )}

        </nav>
      </div>
    </header>
  );
}
