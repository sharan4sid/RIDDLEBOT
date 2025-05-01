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
    console.error('Error fetching initial riddle:', e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) {
      console.error('Stack trace:', e.stack);
    }
    error = 'Failed to load the first riddle. Please try refreshing the page. Check server logs for more details.';
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
            initialRiddleData && <RiddleSolver initialRiddle={initialRiddleData} />
          )}

          {/* Add Chatbot Section */}
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
