'use client'; // Need to make this a client component to use useRef

import { useRef, useContext } from 'react'; // Import useRef and useContext
import { generateRiddle } from '@/ai/flows/generate-riddle';
import RiddleSolver, { type RiddleSolverRef } from '@/components/riddle-solver'; // Import RiddleSolverRef
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Puzzle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { GenerateRiddleOutput } from '@/ai/flows/generate-riddle';
import { useState, useEffect } from 'react';
import { RiddleContext } from '@/context/riddle-context'; // Import RiddleContext


export default function GamePage() {
  const [initialRiddleData, setInitialRiddleData] = useState<GenerateRiddleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const riddleSolverRef = useRef<RiddleSolverRef>(null); // Create a ref for RiddleSolver
  const { currentConstraints } = useContext(RiddleContext); // Get constraints from context


  // Fetch initial riddle on component mount
  useEffect(() => {
    async function fetchInitialRiddle() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch initial riddle without specific constraints from context initially
        console.log("GamePage: Fetching initial riddle...");
        const riddle = await generateRiddle({ constraints: '' });
        console.log("GamePage: Initial riddle fetched successfully.");
        setInitialRiddleData(riddle);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error fetching initial riddle:', errorMessage); // Log the raw error

        // Check specifically for overload/503 errors
        if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
           console.warn('Initial riddle fetch failed due to model overload.');
           setError('Oops! Our riddle generator is very popular right now and seems to be overloaded. Please try refreshing in a moment.');
        } else if (errorMessage.toLowerCase().includes('fetch')) {
             console.warn('Initial riddle fetch failed due to network fetch error.');
             setError('Failed to connect to the riddle generator. Please check your internet connection and try refreshing.');
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

  // Effect to fetch new riddle when constraints change in context
  useEffect(() => {
    // Check if the ref is set, constraints are not null, and we are not currently loading the initial riddle
    if (riddleSolverRef.current && currentConstraints !== null && !isLoading) {
      console.log("GamePage: Context constraints changed, fetching new riddle:", currentConstraints);
      // Call the exposed function on the RiddleSolver component
      riddleSolverRef.current.updateConstraintsAndFetch(currentConstraints);
    }
    // Only run when currentConstraints changes (and component is not initially loading)
    // We check isLoading to prevent fetching based on context immediately on mount
    // before the initial riddle has even loaded.
  }, [currentConstraints, isLoading]); // Rerun when context constraints change or loading state finishes


  return (
    // Adjusted layout for better centering and spacing
    <div className="flex flex-col items-center w-full flex-grow pt-8">
      <Card className="w-full max-w-2xl shadow-lg mb-8 border-border transition-transform duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
        <CardHeader className="text-center bg-card pb-4">
          {/* Centered Title */}
          <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Puzzle className="h-6 w-6 text-primary" /> prahelikā Game {/* Updated title */}
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

       {/* Chatbot is now triggered from the header */}
    </div>
  );
}
