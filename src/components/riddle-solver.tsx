'use client';

import type { GenerateRiddleOutput } from '@/ai/flows/generate-riddle';
import { generateRiddle } from '@/ai/flows/generate-riddle';
import { useState, useTransition, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'; // Added forwardRef, useImperativeHandle
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Loader2, RefreshCcw, Smile, Frown, Info } from 'lucide-react'; // Added Info icon
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils'; // Import cn

const MAX_TRIES = 3;

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer.'),
});

type AnswerFormData = z.infer<typeof answerSchema>;

interface RiddleSolverProps {
  initialRiddle: GenerateRiddleOutput;
}

// Define the interface for the exposed methods
export interface RiddleSolverRef {
  updateConstraintsAndFetch: (constraints: string) => void;
}

const RiddleSolver = forwardRef<RiddleSolverRef, RiddleSolverProps>( // Use forwardRef
  ({ initialRiddle }, ref) => { // Add ref parameter
    const [riddleData, setRiddleData] = useState<GenerateRiddleOutput>(initialRiddle);
    const [triesLeft, setTriesLeft] = useState(MAX_TRIES);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isFetching, startTransition] = useTransition();
    const { toast } = useToast();
    const [currentConstraints, setCurrentConstraints] = useState<string>('');
    const formRef = useRef<HTMLFormElement>(null); // Ref for the form

    const {
      register,
      handleSubmit,
      reset,
      setFocus, // Added setFocus
      formState: { errors },
    } = useForm<AnswerFormData>({
      resolver: zodResolver(answerSchema),
    });

    // Function to fetch a new riddle
    const fetchNewRiddle = useCallback((newConstraints: string = currentConstraints) => {
      setIsCorrect(null);
      setTriesLeft(MAX_TRIES);
      reset({ answer: '' });

      startTransition(async () => {
        try {
          const constraintsToSend = newConstraints || '';
          console.log("Fetching new riddle with constraints:", constraintsToSend); // Keep log for debugging
          const newRiddle = await generateRiddle({ constraints: constraintsToSend });
          setRiddleData(newRiddle);
          // Update internal constraints state ONLY when fetching successfully with new constraints
          setCurrentConstraints(newConstraints);
          toast({ title: 'New Riddle Loaded!', description: 'Let the guessing begin!' });
          setFocus('answer'); // Focus input field after new riddle loads
        } catch (error) {
          console.error("Failed to fetch new riddle:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          let userFriendlyError = "Could not load a new riddle. Please try again.";
          if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
             userFriendlyError = 'Riddle generator is busy! Please try again in a moment.';
          }
          toast({
            title: "Error",
            description: userFriendlyError,
            variant: "destructive",
          });
          // Keep the old riddle, reset state
          setTriesLeft(MAX_TRIES);
          setIsCorrect(null);
          reset({ answer: '' }); // Clear input just in case
        }
      });
    }, [reset, toast, startTransition, currentConstraints, setFocus]); // Ensure currentConstraints is a dependency if used as default

    // Effect to reset state and focus when a new riddle is loaded
    useEffect(() => {
      setTriesLeft(MAX_TRIES);
      setIsCorrect(null);
      reset({ answer: '' });
      if (formRef.current) { // Check if form exists
        setFocus('answer'); // Set focus on the input field
      }
      // Clear constraints when initial riddle changes (e.g. page load)
      // But don't clear if just the text changes due to a fetch triggered by constraints
      if (initialRiddle.riddle !== riddleData.riddle && currentConstraints !== '') {
          // This logic might need refinement depending on how initialRiddle is updated
          // For now, let's assume initialRiddle only changes on full page reload/mount
      }

    }, [initialRiddle.riddle, reset, setFocus]); // Depend on initial riddle text

    // Expose the updateConstraintsAndFetch function using useImperativeHandle
    useImperativeHandle(ref, () => ({
      updateConstraintsAndFetch: (constraints: string) => {
        console.log("RiddleSolver: Updating constraints via ref:", constraints);
        // Don't directly set state here, let fetchNewRiddle handle it on success
        fetchNewRiddle(constraints);
      }
    }), [fetchNewRiddle]); // Add fetchNewRiddle to dependency array


    const handleGuess: SubmitHandler<AnswerFormData> = (data) => {
      if (isCorrect) return; // Don't allow guessing if already correct

      const guess = data.answer.trim().toLowerCase();
      const correctAnswer = riddleData.answer.trim().toLowerCase();

      if (guess === correctAnswer) {
        setIsCorrect(true);
        toast({
          title: "Correct!",
          description: `"${riddleData.answer}" is the right answer!`,
          className: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200', // Success toast styling
        });
      } else {
        const newTries = triesLeft - 1;
        setTriesLeft(newTries);
        setIsCorrect(false); // Indicate incorrect guess visually

        if (newTries === 0) {
          toast({
            title: "Out of Tries!",
            description: `The answer was: ${riddleData.answer}`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: "Incorrect",
            description: `Not quite! ${newTries} ${newTries === 1 ? 'try' : 'tries'} left.`,
            variant: 'destructive', // Use destructive variant for incorrect
          });
           reset({ answer: '' }); // Clear input on incorrect guess
           setFocus('answer');    // Refocus input on incorrect guess
        }
      }
    };

    const showHint = () => {
       toast({
          title: "Here's a Hint:",
          description: riddleData.hint,
          icon: <Lightbulb className="h-5 w-5 text-yellow-500" />, // Use custom icon
          duration: 7000, // Slightly longer duration for hints
       });
    }

    const progressValue = (triesLeft / MAX_TRIES) * 100;
    const progressColor = triesLeft > 1 ? 'bg-primary' : 'bg-destructive'; // Change progress bar color on last try


    return (
      <TooltipProvider>
        <div className="space-y-6">
          {/* Riddle Display Card */}
          <Card className="bg-card text-card-foreground shadow-sm border-border relative overflow-hidden">
             {/* Optional: Difficulty/Topic Badge */}
            {currentConstraints && (
               <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 z-10">
                 <Info size={12}/> {currentConstraints}
               </div>
             )}
            <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
               {/* <CardTitle className="text-lg font-semibold text-primary">Solve This:</CardTitle> */}
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4">
              {isFetching ? (
                 <div className="flex items-center justify-center h-20">
                   <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                   <p className="ml-3 text-muted-foreground">Loading new riddle...</p>
                 </div>
              ) : (
                <p className="text-lg md:text-xl text-center font-medium text-foreground whitespace-pre-wrap min-h-[60px]">
                  {riddleData.riddle}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center gap-4 bg-muted/50 py-3 px-4 sm:px-6 border-t">
               {/* Tries Progress */}
               <div className="flex items-center justify-center space-x-2 w-full max-w-xs">
                  <Label htmlFor="tries" className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tries Left:</Label>
                   <Progress
                      id="tries"
                      value={progressValue}
                      className="w-full h-2 bg-secondary"
                      indicatorClassName={cn('transition-all', progressColor)} // Apply dynamic color
                      aria-label={`${triesLeft} out of ${MAX_TRIES} tries remaining`} />
                  <span className="text-xs font-medium text-muted-foreground w-8 text-right">{triesLeft}/{MAX_TRIES}</span>
               </div>
               {/* Action Buttons */}
               <div className="flex gap-3">
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="outline" size="icon" onClick={showHint} aria-label="Show Hint" disabled={isFetching || isCorrect === true || triesLeft === 0} className="transition-transform duration-150 hover:scale-110 active:scale-100">
                         <Lightbulb className="h-5 w-5" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Show Hint</p>
                     </TooltipContent>
                   </Tooltip>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="outline" size="icon" onClick={() => fetchNewRiddle(currentConstraints)} aria-label="Get New Riddle" disabled={isFetching} className="transition-transform duration-150 hover:scale-110 active:scale-100">
                          {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                       </Button>
                      </TooltipTrigger>
                     <TooltipContent>
                       <p>Get New Riddle{currentConstraints ? ` (${currentConstraints})` : ''}</p>
                     </TooltipContent>
                   </Tooltip>
              </div>
            </CardFooter>
          </Card>

          {/* Input Form Area */}
          {triesLeft > 0 && isCorrect !== true && !isFetching && (
            <form ref={formRef} onSubmit={handleSubmit(handleGuess)} className="space-y-3 transition-opacity duration-300 ease-in-out">
               <div className="relative">
                <Label htmlFor="answer" className="sr-only">Your Answer</Label>
                <Input
                  id="answer"
                  type="text"
                  placeholder="Enter your guess..."
                  className={cn(
                      "w-full text-center text-base transition-colors duration-200",
                      errors.answer ? "border-destructive focus-visible:ring-destructive" : "",
                      isCorrect === false && triesLeft < MAX_TRIES ? "border-destructive/50" : "" // Subtle border hint on incorrect
                  )}
                  aria-invalid={errors.answer ? "true" : "false"}
                  aria-describedby="answer-error"
                  disabled={isFetching}
                  autoComplete="off" // Prevent browser autocomplete
                  {...register('answer')}
                />
                 {/* Visual indicator for incorrect (optional) */}
                 {/* {isCorrect === false && triesLeft < MAX_TRIES && (
                   <Frown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive/70" />
                 )} */}
               </div>
                {errors.answer && <p id="answer-error" className="text-sm text-destructive text-center">{errors.answer.message}</p>}
               <Button type="submit" disabled={isFetching} className="w-full transition-transform duration-150 hover:scale-[1.02] active:scale-100">
                {isFetching ? <Loader2 className="animate-spin" /> : 'Submit Guess'}
              </Button>
            </form>
          )}

          {/* Feedback Alerts */}
          {isCorrect === true && !isFetching && (
            <Alert className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200 animate-in fade-in duration-300">
               <Smile className="h-5 w-5 text-green-600 dark:text-green-400" />
               <AlertTitle className="font-bold">Congratulations!</AlertTitle>
               <AlertDescription>You solved it! The answer was <strong>{riddleData.answer}</strong>.</AlertDescription>
               <Button onClick={() => fetchNewRiddle(currentConstraints)} className="mt-4 w-full sm:w-auto transition-transform duration-150 hover:scale-[1.02] active:scale-100" variant="secondary" size="sm" disabled={isFetching}>
                 {isFetching ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                 Play Again {currentConstraints ? `(${currentConstraints})` : ''}
               </Button>
            </Alert>
          )}

          {triesLeft === 0 && isCorrect === false && !isFetching && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 animate-in fade-in duration-300">
              <Frown className="h-5 w-5" />
               <AlertTitle className="font-bold">Game Over!</AlertTitle>
              <AlertDescription>
                Out of tries! The correct answer was: <strong>{riddleData.answer}</strong>
              </AlertDescription>
               <Button onClick={() => fetchNewRiddle(currentConstraints)} className="mt-4 w-full sm:w-auto transition-transform duration-150 hover:scale-[1.02] active:scale-100" variant="secondary" size="sm" disabled={isFetching}>
                  {isFetching ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                 Try a New Riddle {currentConstraints ? `(${currentConstraints})` : ''}
               </Button>
            </Alert>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

RiddleSolver.displayName = "RiddleSolver"; // Add display name for forwardRef

export default RiddleSolver;
