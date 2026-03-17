'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { submitSuggestion } from '@/actions/submit-suggestion';

export function SuggestionBox() {
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('suggestion', suggestion);
      
      const result = await submitSuggestion(formData);

      if (result.success) {
        setSuccess(true);
        setSuggestion('');
        toast({
          title: 'Suggestion Sent!',
          description: 'Thank you for your feedback.',
          className: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
        });
      } else {
        toast({
          title: 'Failed to Send',
          description: result.error || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg border-border mt-4 transition-transform duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
      <CardHeader className="bg-card pb-4">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" /> Suggestion Box
        </CardTitle>
        <CardDescription>Have an idea or feedback? Let us know directly!</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400 text-center">
                Your suggestion has been mailed successfully!
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => setSuccess(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <Textarea
              placeholder="Type your suggestion or feedback here..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[120px] resize-y"
              required
              minLength={5}
            />
          )}
        </CardContent>

        {!success && (
          <CardFooter className="bg-muted/50 py-3 px-6 border-t flex justify-end">
            <Button type="submit" disabled={isSubmitting || suggestion.trim().length < 5}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Suggestion'
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
