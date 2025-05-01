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
    .describe('Optional constraints to apply when generating the riddle.'),
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
    schema: z.object({
      constraints: z
        .string()
        .describe('Optional constraints to apply when generating the riddle.'),
    }),
  },
  output: {
    schema: z.object({
      riddle: z.string().describe('The generated riddle.'),
      answer: z.string().describe('The answer to the generated riddle.'),
      hint: z.string().describe('A hint to help solve the riddle.'),
    }),
  },
  prompt: `You are a riddle generator. Generate a riddle, provide the answer, and generate a hint.

  Constraints: {{constraints}}

  Riddle:
  Answer:
  Hint:`,
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
    return output!;
  }
);
