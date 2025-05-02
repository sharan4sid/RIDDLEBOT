'use client';

import Link from 'next/link';
import { Home, Puzzle, MessageSquare, BrainCircuit } from 'lucide-react'; // Added MessageSquare, BrainCircuit
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
} from "@/components/ui/dialog"; // Import Dialog components
import Chatbot from '@/components/chatbot'; // Import Chatbot

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    // Updated background to use primary color with opacity and blur
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary/5 backdrop-blur supports-[backdrop-filter]:bg-primary/10 shadow-sm">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        {/* Logo/Title Section - Updated Link href, icon and text */}
        <Link href="/home" className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors">
           <BrainCircuit className="h-6 w-6 text-primary" /> {/* Changed icon */}
           <span>prahelikā</span> {/* Changed title */}
        </Link>

        {/* Navigation Section - Increased spacing */}
        <nav className="flex items-center space-x-2 sm:space-x-4"> {/* Increased space-x */}
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

           {/* Chatbot Dialog Trigger */}
           <Dialog>
             <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50" aria-label="Open Chatbot">
                  <MessageSquare className="h-5 w-5" />
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[425px] p-0"> {/* Remove default padding */}
                <DialogHeader className="p-6 pb-4"> {/* Add padding back here */}
                  <DialogTitle>Chat with RiddleBot</DialogTitle>
                  <DialogDescription>
                    Ask to change difficulty (easy, medium, hard) or topic (e.g., animals, science).
                  </DialogDescription>
                </DialogHeader>
                {/* Chatbot component now lives inside the dialog */}
                <div className="p-6 pt-0"> {/* Add padding for the content */}
                    <Chatbot />
                </div>
                {/* Note: No explicit footer needed unless we add actions */}
             </DialogContent>
           </Dialog>

           <ThemeToggleButton /> {/* Add the theme toggle button */}
        </nav>
      </div>
    </header>
  );
}
