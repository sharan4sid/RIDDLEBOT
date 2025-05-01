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
  prompt: `You are a master riddle generator. Generate a single, engaging riddle based on the provided constraints. Also provide the answer and a helpful hint.

Constraints:
"{{#if constraints}}{{constraints}}{{else}}None provided (generate a general riddle of medium difficulty).{{/if}}"

Instructions based on constraints:
- If difficulty is specified (easy, medium, hard), adjust the complexity of the riddle accordingly. 'Easy' should be suitable for children or beginners. 'Hard' should be challenging. Default to 'medium' if unspecified.
- If a topic is specified, the riddle MUST be about that topic.
- Ensure the riddle, answer, and hint are distinct and make sense together.

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
    const {output} = await generateRiddlePrompt(input);
     // Add basic validation or default values if output is null
    if (!output) {
      console.error("Riddle generation failed, received null output.");
      // Provide a fallback riddle or re-throw error
      return {
        riddle: "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?",
        answer: "A map",
        hint: "I show you places but can't take you there."
      };
    }
    return output;
  }
);

