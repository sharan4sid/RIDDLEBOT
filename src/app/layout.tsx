import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { RiddleProvider } from '@/context/riddle-context';
import { PlayerProvider } from '@/context/player-context';
import { AuthProvider } from '@/components/auth-provider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'prahelikā',
  description: 'A fun riddle solving game powered by AI',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased flex flex-col', geistSans.variable, geistMono.variable)} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <PlayerProvider>
              <RiddleProvider>
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
                <Toaster />
              </RiddleProvider>
            </PlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
