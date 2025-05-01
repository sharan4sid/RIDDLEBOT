import { generateRiddle } from '@/ai/flows/generate-riddle';
import RiddleSolver from '@/components/riddle-solver';
import Chatbot from '@/components/chatbot'; // Import the Chatbot component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion components

export default async function Home() {
  let initialRiddleData = null;
  let error = null;

  try {
    // Generate initial riddle with no specific constraints
    initialRiddleData = await generateRiddle({ constraints: '' });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Error fetching initial riddle:', errorMessage);
    if (e instanceof Error && e.stack) {
      console.error('Stack trace:', e.stack);
    }
    // Provide a more specific user-facing error message
    error = `Failed to load the first riddle. ${errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded') ? 'The riddle service might be temporarily overloaded.' : ''} Please try refreshing the page.`;

  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center bg-primary rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary-foreground">RiddleMeThis</CardTitle>
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
               // Handle the case where initialRiddleData is null but there was no error (shouldn't happen with current logic, but safe)
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Could not load initial riddle data.</AlertDescription>
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
    </main>
  );
}
