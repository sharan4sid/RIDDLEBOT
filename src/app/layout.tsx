import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import Header from '@/components/header'; // Import Header component
import { cn } from '@/lib/utils'; // Import cn for combining class names
import { ThemeProvider } from '@/components/theme-provider'; // Import ThemeProvider
import { RiddleProvider } from '@/context/riddle-context'; // Import RiddleProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'prahelikā', // Update title
  description: 'A fun riddle solving game powered by AI', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      {/* Apply font variables to body tag instead */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col', // Use cn helper, set min-h-screen, flex-col layout
           geistSans.variable,
           geistMono.variable
        )}
        suppressHydrationWarning // Add suppressHydrationWarning here
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange // Ensure this is true to allow custom CSS transitions
        >
          <RiddleProvider> {/* Wrap with RiddleProvider */}
            <Header /> {/* Add Header component */}
            {/* Added flex-grow to main content area */}
            <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
            <Toaster /> {/* Add Toaster component */}
          </RiddleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
