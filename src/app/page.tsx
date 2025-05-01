import { generateRiddle } from '@/ai/flows/generate-riddle';
import RiddleSolver from '@/components/riddle-solver';
import Chatbot from '@/components/chatbot'; // Import the Chatbot component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MessageSquare, Puzzle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion components

export default async function GamePage() {
  let initialRiddleData = null;
  let error = null;

  try {
    // Generate initial riddle with no specific constraints
    initialRiddleData = await generateRiddle({ constraints: '' });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    // Check specifically for overload/503 errors
    if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
       console.warn('Initial riddle fetch failed due to model overload.'); // Use warn for expected operational issues
       error = 'Oops! Our riddle generator is very popular right now and seems to be overloaded. Please try refreshing in a moment.';
    } else {
       // Log unexpected errors less verbosely in UI, more in console
       console.error('Error fetching initial riddle:', errorMessage);
       error = 'Failed to load the first riddle due to an unexpected error. Please try refreshing the page.';
    }
  }

  return (
    // Adjusted layout for better centering and spacing
    <div className="flex flex-col items-center w-full flex-grow pt-8">
      <Card className="w-full max-w-2xl shadow-lg mb-8 border-border transition-transform duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
        <CardHeader className="text-center bg-card pb-4">
          {/* Centered Title */}
          <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Puzzle className="h-6 w-6 text-primary" /> RiddleMeThis Game
          </CardTitle>
          <CardDescription>Test your wit against our AI Riddle Master!</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error ? (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
             // Ensure initialRiddleData is not null before rendering RiddleSolver
            initialRiddleData ? (
               <RiddleSolver initialRiddle={initialRiddleData} />
             ) : (
               // This case handles if initialRiddleData is null even without a caught error
               <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Could not load initial riddle data. Please refresh.</AlertDescription>
               </Alert>
             )
          )}
        </CardContent>
      </Card>

      {/* Accordion for Chatbot below the main card */}
       <Accordion type="single" collapsible className="w-full max-w-2xl">
        <AccordionItem value="chatbot" className="border rounded-lg shadow-sm bg-card border-border transition-shadow duration-200 ease-in-out hover:shadow-md">
           <AccordionTrigger className="text-lg font-medium px-6 py-4 hover:no-underline hover:bg-accent/50 rounded-t-lg [&[data-state=open]]:rounded-b-none transition-colors">
            <div className="flex items-center gap-3 text-foreground">
               <MessageSquare className="h-5 w-5 text-primary" />
               <span>Need help or want to customize? Chat with our Bot!</span>
            </div>
           </AccordionTrigger>
          <AccordionContent className="p-6 border-t border-border">
             <Chatbot />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
