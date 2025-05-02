import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, History, Home, Puzzle, BrainCircuit } from 'lucide-react'; // Import relevant icons, added BrainCircuit

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="shadow-md border-border transition-transform duration-200 ease-in-out hover:scale-[1.01] hover:shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold flex items-center gap-3 text-foreground">
            <BrainCircuit className="h-7 w-7 text-primary" /> {/* Using the same icon as header */}
            <span>Welcome to prahelikā!</span> {/* Updated title */}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-1">
            Your gateway to the intriguing world of riddles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">
            Dive into the fascinating world of riddles! Whether you're a seasoned solver or just starting, this is your hub for everything riddle-related. Explore different types, learn how to sharpen your thinking, and discover the rich history behind these playful puzzles.
          </p>
          <p className="mt-3 text-base">
            Ready to test your skills? Head over to the <strong className="text-primary">Game</strong> section!
          </p>
        </CardContent>
      </Card>

      {/* Grid for Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Types of Riddles Card */}
        <Card className="shadow-md border-border flex flex-col transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
              <Puzzle className="h-5 w-5 text-primary" />
              Types of Riddles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="mb-3 text-sm text-muted-foreground">Riddles challenge us in various ways:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-snug">
              <li><strong>Enigmas:</strong> Metaphorical or allegorical (e.g., "What has an eye, but cannot see?" - A needle).</li>
              <li><strong>Conundrums:</strong> Rely on puns/wordplay (e.g., "What kind of band never plays music?" - A rubber band).</li>
              <li><strong>Logic Puzzles:</strong> Require deductive reasoning (e.g., River crossing puzzles).</li>
              <li><strong>Mathematical Riddles:</strong> Involve numbers/math concepts (e.g., "I am odd. Take away a letter, I become even." - Seven).</li>
              <li><strong>Lateral Thinking:</strong> Require thinking outside the box (e.g., "A man walks into a bar...").</li>
            </ul>
          </CardContent>
        </Card>

        {/* How to Think Card */}
        <Card className="shadow-md border-border flex flex-col transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
               <Brain className="h-5 w-5 text-primary" />
              Think Like a Solver
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="mb-3 text-sm text-muted-foreground">Develop your riddle-solving skills:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-snug">
              <li><strong>Read Carefully:</strong> Every word counts.</li>
              <li><strong>Look for Double Meanings:</strong> Wordplay is common.</li>
              <li><strong>Think Metaphorically:</strong> Don't always be literal.</li>
              <li><strong>Consider Personification:</strong> Objects given human traits.</li>
              <li><strong>Eliminate Possibilities:</strong> Rule out what doesn't fit.</li>
              <li><strong>Don't Overthink:</strong> Simple answers exist.</li>
              <li><strong>Break It Down:</strong> Analyze clues piece by piece.</li>
            </ul>
          </CardContent>
        </Card>

        {/* History Card - Updated Content */}
        <Card className="shadow-md border-border flex flex-col transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
               <History className="h-5 w-5 text-primary" />
              Riddles in Indian History
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
             <p className="mb-3 text-sm text-muted-foreground">Riddles (Prahelikā) have a rich tradition in India:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-snug">
              <li><strong>Ancient Texts:</strong> Found in Vedas, Upanishads, and Puranas, often conveying philosophical ideas.</li>
              <li><strong>Epics:</strong> The Mahabharata features the famous "Yaksha Prashna," where Yudhisthira answers riddles posed by a Yaksha.</li>
              <li><strong>Folklore & Literature:</strong> Riddles are integral to folk tales (like Vikram and Betal) and classical literature, used for wit and wisdom tests.</li>
              <li><strong>Regional Diversity:</strong> Varying forms and styles exist across India's diverse languages and cultures (e.g., 'Paheli' in Hindi, 'Kadha' in Malayalam).</li>
              <li><strong>Purpose:</strong> Used historically for education, entertainment, testing intelligence, and spiritual discourse.</li>
            </ul>
             <p className="mt-3 text-sm leading-snug">They remain a popular form of intellectual play and cultural expression.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
