'use client';

import Link from 'next/link';
import { Home, Puzzle, MessageSquare, BrainCircuit, Info } from 'lucide-react'; // Added Info icon
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Chatbot from '@/components/chatbot';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary/5 backdrop-blur supports-[backdrop-filter]:bg-primary/10 shadow-sm">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/home" className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors">
           <BrainCircuit className="h-6 w-6 text-primary" />
           <span>prahelikā</span>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/home" passHref>
             <Button
                variant="ghost"
                className={cn(
                  'transition-colors px-3 py-2 text-sm font-medium',
                  isActive('/home')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
             >
                <Home className="mr-1.5 h-4 w-4" />
                Home
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button
                 variant="ghost"
                 className={cn(
                   'transition-colors px-3 py-2 text-sm font-medium',
                   isActive('/')
                     ? 'bg-accent text-accent-foreground'
                     : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                 )}
             >
              <Puzzle className="mr-1.5 h-4 w-4" />
              Game
            </Button>
          </Link>
          <Link href="/about" passHref>
             <Button
                variant="ghost"
                className={cn(
                  'transition-colors px-3 py-2 text-sm font-medium',
                  isActive('/about')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
             >
                <Info className="mr-1.5 h-4 w-4" />
                About
            </Button>
          </Link>

           <Dialog>
             <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50" aria-label="Open Chatbot">
                  <MessageSquare className="h-5 w-5" />
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[425px] p-0">
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle>Chat with RiddleBot</DialogTitle>
                  <DialogDescription>
                    Ask to change difficulty (easy, medium, hard) or topic (e.g., animals, science).
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 pt-0">
                    <Chatbot />
                </div>
             </DialogContent>
           </Dialog>

           <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
}
