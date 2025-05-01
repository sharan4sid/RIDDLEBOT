import { generateRiddle } from '@/ai/flows/generate-riddle';
import RiddleSolver from '@/components/riddle-solver';
import Chatbot from '@/components/chatbot'; // Import the Chatbot component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MessageSquare, Puzzle } from 'lucide-react'; // Added Puzzle icon
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion components

export default async function GamePage() { // Renamed component for clarity
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
       error = 'Failed to load the first riddle. The riddle service might be temporarily overloaded. Please try refreshing the page.';
    } else {
       // Log unexpected errors more verbosely
       // console.error('Error fetching initial riddle:', errorMessage); // Reduced console noise for handled errors
       error = 'Failed to load the first riddle. An unexpected error occurred. Please try refreshing the page.';
    }
  }

  return (
    // Removed min-h-screen and justify-center to allow content flow below header
    <div className="flex flex-col items-center p-4 md:p-8 bg-secondary flex-grow">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center bg-primary rounded-t-lg">
          {/* Updated Card Title */}
          <CardTitle className="text-2xl font-bold text-primary-foreground flex items-center justify-center gap-2">
            <Puzzle className="h-6 w-6" /> RiddleMeThis Game
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
             // Ensure initialRiddleData is not null before rendering RiddleSolver
            initialRiddleData ? (
               <RiddleSolver initialRiddle={initialRiddleData} />
             ) : (
               // This case handles if initialRiddleData is null even without a caught error (should be rare)
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Could not load initial riddle data. Please refresh.</AlertDescription>
               </Alert>
             )
          )}

          {/* Add Chatbot Section - Render even if initial riddle fails */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="chatbot">
              <AccordionTrigger className="text-lg font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                   <MessageSquare className="h-5 w-5" />
                   <span>Need Help or Want to Customize? Chat with our Bot!</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                 <Chatbot />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
