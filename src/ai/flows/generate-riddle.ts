'use server';
/**
 * @fileOverview Generates a riddle on demand using GenAI, incorporating user-provided constraints.
 *
 * - generateRiddle - A function that handles riddle generation.
 * - GenerateRiddleInput - The input type for the generateRiddle function.
 * - GenerateRiddleOutput - The return type for the generateRiddle function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateRiddleInputSchema = z.object({
  constraints: z
    .string()
    .describe('Optional constraints to apply when generating the riddle. Can include difficulty (easy, medium, hard) and topic (e.g., animals, science).'),
});
export type GenerateRiddleInput = z.infer<typeof GenerateRiddleInputSchema>;

const GenerateRiddleOutputSchema = z.object({
  riddle: z.string().describe('The generated riddle.'),
  answer: z.string().describe('The answer to the generated riddle.'),
  hint: z.string().describe('A hint to help solve the riddle.'),
});
export type GenerateRiddleOutput = z.infer<typeof GenerateRiddleOutputSchema>;

export async function generateRiddle(input: GenerateRiddleInput): Promise<GenerateRiddleOutput> {
  return generateRiddleFlow(input);
}

const generateRiddlePrompt = ai.definePrompt({
  name: 'generateRiddlePrompt',
  input: {
    schema: GenerateRiddleInputSchema, // Use the updated schema description
  },
  output: {
    schema: GenerateRiddleOutputSchema, // Output remains the same
  },
  prompt: `You are a master riddle generator. Generate a single, engaging riddle based on the provided constraints. Also provide the answer and a helpful hint. The answer should be a single word or short phrase, easy to guess based on the riddle.

Constraints:
"{{#if constraints}}{{constraints}}{{else}}None provided (generate a general riddle of medium difficulty).{{/if}}"

Instructions based on constraints:
- If difficulty is specified (easy, medium, hard), adjust the complexity of the riddle accordingly. 'Easy' should be suitable for children or beginners. 'Hard' should be challenging. Default to 'medium' if unspecified.
- If a topic is specified, the riddle MUST be about that topic.
- Ensure the riddle, answer, and hint are distinct and make sense together.
- Ensure the answer comparison is case-insensitive on the client-side.

Output Format (Strictly follow this):
Riddle: [Your generated riddle here]
Answer: [The answer to the riddle]
Hint: [A helpful hint for the riddle]

---
Generate now:
`,
});


const generateRiddleFlow = ai.defineFlow<
  typeof GenerateRiddleInputSchema,
  typeof GenerateRiddleOutputSchema
>(
  {
    name: 'generateRiddleFlow',
    inputSchema: GenerateRiddleInputSchema,
    outputSchema: GenerateRiddleOutputSchema,
  },
  async input => {
    try {
        const {output} = await generateRiddlePrompt(input);
         // Add basic validation or default values if output is null
        if (!output || !output.riddle || !output.answer || !output.hint) {
          console.error("Riddle generation failed, received null or incomplete output.");
          // Provide a fallback riddle or re-throw error
          return {
            riddle: "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?",
            answer: "A map",
            hint: "I show you places but can't take you there."
          };
        }
        return output;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error in generateRiddleFlow:', errorMessage);

        let userFriendlyRiddle = "Oops! Our riddle generator seems to be taking a nap. Maybe try fetching a new one?";
        let userFriendlyAnswer = "Error";
        let userFriendlyHint = "Something went wrong. Try again!";

        // Check specifically for overload/503 errors
        if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
            console.warn('Riddle generation failed due to model overload.');
             userFriendlyRiddle = "The Riddle Master is very popular right now! 😅 Please try asking for a new riddle in a moment.";
             userFriendlyAnswer = "Overload";
             userFriendlyHint = "The server is busy.";
        } else if (errorMessage.toLowerCase().includes('fetch')) {
             console.warn('Riddle generation failed due to a network fetch error.');
             userFriendlyRiddle = "Hmm, couldn't connect to the Riddle Master. Please check your connection and try again.";
             userFriendlyAnswer = "Network Error";
             userFriendlyHint = "Connection issue.";
        } else {
            console.error('Unexpected error during riddle generation:', errorMessage);
             userFriendlyRiddle = "An unexpected glitch happened while creating your riddle. Please try again.";
             userFriendlyAnswer = "Unexpected Error";
             userFriendlyHint = "A system hiccup occurred.";
        }

        // Return a valid GenerateRiddleOutput object indicating an error occurred
        return {
            riddle: userFriendlyRiddle,
            answer: userFriendlyAnswer,
            hint: userFriendlyHint,
        };
    }
  }
);

