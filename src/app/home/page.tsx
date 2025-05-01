import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Brain, History, Lightbulb, Puzzle, Home } from 'lucide-react'; // Import Home icon

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center gap-2"><Home className="h-6 w-6" /> Welcome to RiddleMeThis!</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-lg mb-4">
            Dive into the fascinating world of riddles! Whether you're a seasoned solver or just starting, this is your hub for everything riddle-related. Explore different types, learn how to sharpen your thinking, and discover the rich history behind these playful puzzles.
          </p>
          <p>Use the "Riddle Game" link in the header to test your skills!</p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="types" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="text-lg font-medium px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              <span>Types of Riddles</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 text-muted-foreground">
            <p className="mb-2">Riddles come in many forms, challenging us in unique ways:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Enigmas:</strong> These often use metaphorical or allegorical language, requiring clever interpretation. (Example: "What has an eye, but cannot see?" - A needle)</li>
              <li><strong>Conundrums:</strong> These are questions that rely on puns or wordplay in their answer. (Example: "What kind of band never plays music?" - A rubber band)</li>
              <li><strong>Logic Puzzles:</strong> These present a scenario and require deductive reasoning to find the solution. (Example: The classic river crossing puzzles)</li>
              <li><strong>Mathematical Riddles:</strong> These involve numbers and mathematical concepts. (Example: "I am an odd number. Take away a letter and I become even. What number am I?" - Seven)</li>
              <li><strong>Lateral Thinking Puzzles:</strong> These require you to think outside the box and question assumptions in the premise. (Example: "A man walks into a bar and asks for a glass of water...")</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="solving" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="text-lg font-medium px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
               <Brain className="h-5 w-5 text-primary" />
              <span>How to Think Like a Riddle Solver</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 text-muted-foreground">
            <p className="mb-2">Solving riddles is a skill you can develop. Here are some tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Read Carefully:</strong> Pay attention to every word. Sometimes the key is in a small detail.</li>
              <li><strong>Look for Double Meanings:</strong> Riddles often play on words with multiple meanings.</li>
              <li><strong>Think Metaphorically:</strong> Don't always take things literally. What could the words represent?</li>
              <li><strong>Consider Personification:</strong> Objects are often given human-like qualities.</li>
              <li><strong>Eliminate Possibilities:</strong> Rule out answers that don't fit all the clues.</li>
              <li><strong>Don't Overthink:</strong> Sometimes the answer is simpler than you expect.</li>
              <li><strong>Break It Down:</strong> Analyze the riddle piece by piece. What does each clue tell you?</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="history" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="text-lg font-medium px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
               <History className="h-5 w-5 text-primary" />
              <span>A Brief History of Riddles</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 text-muted-foreground">
            <p className="mb-2">Riddles are one of the oldest forms of literature and entertainment, found across cultures and throughout history:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Ancient Times:</strong> The Riddle of the Sphinx from Greek mythology is perhaps the most famous ancient riddle. Sumerian and Babylonian cuneiform tablets also contain riddles.</li>
              <li><strong>Biblical Riddles:</strong> The story of Samson in the Hebrew Bible features a well-known riddle about honey in the carcass of a lion.</li>
              <li><strong>Anglo-Saxon Riddles:</strong> The Exeter Book, a 10th-century manuscript, contains a collection of Old English riddles, offering insights into everyday life and beliefs.</li>
              <li><strong>Medieval & Renaissance:</strong> Riddles continued to be popular in folklore, literature (like Shakespeare), and social gatherings.</li>
              <li><strong>Modern Era:</strong> Riddles persist in books, games, and online, adapting to new forms but retaining their core challenge of wit and cleverness.</li>
            </ul>
            <p className="mt-2">They have served as tests of intelligence, forms of entertainment, educational tools, and even parts of rituals or folklore.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
