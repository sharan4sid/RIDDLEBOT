"use client";

import type { GenerateRiddleOutput } from '@/ai/flows/generate-riddle';
import { generateRiddle } from '@/ai/flows/generate-riddle';
import { useState, useTransition, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Loader2, RefreshCcw, Smile, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MAX_TRIES = 3;

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer.'),
});

type AnswerFormData = z.infer<typeof answerSchema>;

interface RiddleSolverProps {
  initialRiddle: GenerateRiddleOutput;
}

export default function RiddleSolver({ initialRiddle }: RiddleSolverProps) {
  const [riddleData, setRiddleData] = useState<GenerateRiddleOutput>(initialRiddle);
  const [triesLeft, setTriesLeft] = useState(MAX_TRIES);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFetching, startTransition] = useTransition();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
  });

  useEffect(() => {
    // Reset state when a new riddle is loaded (except the initial one)
    setTriesLeft(MAX_TRIES);
    setIsCorrect(null);
    reset({ answer: '' }); // Clear the input field
  }, [riddleData.riddle, reset]); // Depend on riddle text to detect new riddle

  const handleGuess: SubmitHandler<AnswerFormData> = (data) => {
    const guess = data.answer.trim().toLowerCase();
    const correctAnswer = riddleData.answer.trim().toLowerCase();

    if (guess === correctAnswer) {
      setIsCorrect(true);
      toast({
        title: "Correct!",
        description: "You solved the riddle!",
        variant: 'default', // Use default variant for success
      });
    } else {
      const newTries = triesLeft - 1;
      setTriesLeft(newTries);
      setIsCorrect(false);

      if (newTries === 0) {
        toast({
          title: "Out of Tries!",
          description: `The answer was: ${riddleData.answer}`,
          variant: 'destructive',
        });
      } else {
         toast({
          title: "Incorrect",
          description: `Try again! ${newTries} ${newTries === 1 ? 'try' : 'tries'} left.`,
          variant: 'destructive',
        });
      }
    }
  };

  const fetchNewRiddle = () => {
     setIsCorrect(null); // Reset correctness state immediately
     startTransition(async () => {
      try {
        const newRiddle = await generateRiddle({ constraints: '' }); // Add constraint input later if needed
        setRiddleData(newRiddle);
      } catch (error) {
        console.error("Failed to fetch new riddle:", error);
        toast({
          title: "Error",
          description: "Could not load a new riddle. Please try again.",
          variant: "destructive",
        });
         // Optionally reset to initial riddle or show an error state
        // For now, we keep the old riddle
      }
    });
  };


  const showHint = () => {
     toast({
        title: "Hint",
        description: riddleData.hint,
      });
  }

  const progressValue = (triesLeft / MAX_TRIES) * 100;

  return (
    <TooltipProvider>
      <div className="space-y-6 text-center">
        <Card className="bg-card text-card-foreground shadow-inner">
          <CardHeader>
             <CardTitle className="text-xl font-semibold">Solve This Riddle:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg whitespace-pre-wrap mb-4">{riddleData.riddle}</p>
             <div className="flex items-center justify-center space-x-2 mb-4">
                <Label htmlFor="tries" className="text-sm font-medium text-muted-foreground">Tries Left:</Label>
                <Progress id="tries" value={progressValue} className="w-1/2 h-2" aria-label={`${triesLeft} out of ${MAX_TRIES} tries remaining`} />
                <span className="text-sm font-medium text-muted-foreground">{triesLeft}/{MAX_TRIES}</span>
            </div>
          </CardContent>
           <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={showHint} aria-label="Show Hint" disabled={isFetching || isCorrect === true || triesLeft === 0}>
                    <Lightbulb className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show Hint</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={fetchNewRiddle} aria-label="Get New Riddle" disabled={isFetching}>
                     {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                  </Button>
                 </TooltipTrigger>
                <TooltipContent>
                  <p>Get New Riddle</p>
                </TooltipContent>
              </Tooltip>
          </CardFooter>
        </Card>


        {triesLeft > 0 && isCorrect !== true && (
          <form onSubmit={handleSubmit(handleGuess)} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="answer" className="sr-only">Your Answer</Label>
              <Input
                id="answer"
                type="text"
                placeholder="Enter your guess..."
                className="max-w-xs text-center"
                aria-invalid={errors.answer ? "true" : "false"}
                aria-describedby="answer-error"
                disabled={isFetching}
                {...register('answer')}
              />
              {errors.answer && <p id="answer-error" className="text-sm text-destructive">{errors.answer.message}</p>}
            </div>
            <Button type="submit" disabled={isFetching} className="w-full max-w-xs">
              {isFetching ? <Loader2 className="animate-spin" /> : 'Submit Guess'}
            </Button>
          </form>
        )}

        {isCorrect === true && (
          <Alert className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200">
             <Smile className="h-5 w-5 text-green-600 dark:text-green-400" />
             <AlertTitle className="font-bold">Congratulations!</AlertTitle>
            <AlertDescription>You guessed it right!</AlertDescription>
             <Button onClick={fetchNewRiddle} className="mt-4" variant="secondary" size="sm" disabled={isFetching}>
               {isFetching ? <Loader2 className="animate-spin mr-2" /> : null}
               Play Again
             </Button>
          </Alert>
        )}

        {triesLeft === 0 && isCorrect === false && (
          <Alert variant="destructive">
            <Frown className="h-5 w-5" />
             <AlertTitle className="font-bold">Game Over!</AlertTitle>
            <AlertDescription>
              You've run out of tries. The correct answer was: <strong>{riddleData.answer}</strong>
            </AlertDescription>
             <Button onClick={fetchNewRiddle} className="mt-4" variant="secondary" size="sm" disabled={isFetching}>
                {isFetching ? <Loader2 className="animate-spin mr-2" /> : null}
               Try a New Riddle
             </Button>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
}
