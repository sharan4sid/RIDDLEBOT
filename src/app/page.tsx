import { generateRiddle } from '@/ai/flows/generate-riddle';
import RiddleSolver from '@/components/riddle-solver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function Home() {
  let initialRiddleData = null;
  let error = null;

  try {
    initialRiddleData = await generateRiddle({ constraints: '' });
  } catch (e) {
    console.error('Error fetching initial riddle:', e);
    error = 'Failed to load the first riddle. Please try refreshing the page.';
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
        </CardContent>
      </Card>
    </main>
  );
}
