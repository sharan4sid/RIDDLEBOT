'use client'; // Need to make this a client component to use useRef

import { useRef } from 'react'; // Import useRef
import { generateRiddle } from '@/ai/flows/generate-riddle';
import RiddleSolver, { type RiddleSolverRef } from '@/components/riddle-solver'; // Import RiddleSolverRef
import Chatbot, { type ConstraintUpdate } from '@/components/chatbot'; // Import Chatbot and ConstraintUpdate
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MessageSquare, Puzzle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion components
import type { GenerateRiddleOutput } from '@/ai/flows/generate-riddle';
import { useState, useEffect } from 'react';


export default function GamePage() {
  const [initialRiddleData, setInitialRiddleData] = useState<GenerateRiddleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const riddleSolverRef = useRef<RiddleSolverRef>(null); // Create a ref for RiddleSolver


  // Fetch initial riddle on component mount
  useEffect(() => {
    async function fetchInitialRiddle() {
      setIsLoading(true);
      setError(null);
      try {
        const riddle = await generateRiddle({ constraints: '' });
        setInitialRiddleData(riddle);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error fetching initial riddle:', errorMessage); // Log the raw error

        // Check specifically for overload/503 errors
        if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
           console.warn('Initial riddle fetch failed due to model overload.');
           setError('Oops! Our riddle generator is very popular right now and seems to be overloaded. Please try refreshing in a moment.');
        } else {
           // Log unexpected errors less verbosely in UI, more in console
           console.error('Unexpected error fetching initial riddle:', errorMessage);
           setError('Failed to load the first riddle due to an unexpected error. Please try refreshing the page.');
        }
         setInitialRiddleData(null); // Ensure data is null on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialRiddle();
  }, []); // Empty dependency array ensures this runs only once on mount


  // Handle constraint changes from the chatbot
  const handleConstraintChange = (update: ConstraintUpdate) => {
      console.log("GamePage: Received constraint update from Chatbot:", update);
      // Combine type and value into a single constraint string for the riddle generator
      const constraintString = `${update.type}: ${update.value}`;
      riddleSolverRef.current?.updateConstraintsAndFetch(constraintString);
  };


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
        <CardContent className="p-6 space-y-6 min-h-[200px]"> {/* Added min-h */}
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
               <p className="text-muted-foreground">Loading the first riddle...</p>
             </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
             // Ensure initialRiddleData is not null before rendering RiddleSolver
            initialRiddleData ? (
               <RiddleSolver ref={riddleSolverRef} initialRiddle={initialRiddleData} /> // Pass the ref
             ) : (
               // This case handles if initialRiddleData is null even without a caught error (should be rare now)
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
              {/* Pass the handler function to the Chatbot */}
             <Chatbot onConstraintChange={handleConstraintChange} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
