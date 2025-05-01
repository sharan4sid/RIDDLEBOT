'use server';
/**
 * @fileOverview Chatbot flow to handle user requests for changing riddle difficulty or topic.
 *
 * - chatWithRiddleBot - Handles a single turn of conversation with the chatbot.
 * - ChatInput - The input type for the chatWithRiddleBot function.
 * - ChatOutput - The return type for the chatWithRiddleBot function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define possible intents the bot can recognize
const IntentEnum = z.enum(['difficulty', 'topic', 'chit_chat', 'unknown']);

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  // Optional: Add chat history here if needed for more complex conversations
  // history: z.array(z.object({ role: z.enum(['user', 'bot']), content: z.string() })).optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user.'),
  intent: IntentEnum.describe(
    'The recognized intent of the user message (difficulty, topic, chit_chat, or unknown).'
  ),
  value: z
    .string()
    .optional()
    .describe(
      'The specific value associated with the intent (e.g., "easy", "hard", "animals", "science") if applicable.'
    ),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


// Exported function to be called by the frontend
export async function chatWithRiddleBot(input: ChatInput): Promise<ChatOutput> {
  return chatWithRiddleBotFlow(input);
}


const chatWithRiddleBotPrompt = ai.definePrompt({
  name: 'chatWithRiddleBotPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a friendly chatbot assistant for the "RiddleMeThis" game. Your goal is to help users customize their riddle experience.

Available Actions:
1. Change Difficulty: Users can ask to set the difficulty to 'easy', 'medium', or 'hard'.
2. Select Topic: Users can ask for riddles about a specific topic (e.g., 'animals', 'science', 'history', 'food').
3. Chit-chat: Respond politely to greetings or general conversation.

Your Task:
Analyze the user's message: "{{message}}"
Determine the user's intent and extract any relevant values (difficulty level or topic).
Respond appropriately to the user.

Output Format:
Provide your response in the specified JSON format.
- If the user wants to change difficulty, set intent to "difficulty" and value to "easy", "medium", or "hard".
- If the user wants to select a topic, set intent to "topic" and value to the requested topic (lowercase).
- If the user is just chatting, set intent to "chit_chat" and provide a friendly response.
- If the intent is unclear or requests something else, set intent to "unknown" and ask for clarification or state you cannot fulfill the request.

Example User Message: "Make the riddles harder please"
Example Output: { "response": "Okay, I've set the difficulty to hard for the next riddle!", "intent": "difficulty", "value": "hard" }

Example User Message: "Tell me a riddle about animals"
Example Output: { "response": "Sure thing! The next riddle will be about animals.", "intent": "topic", "value": "animals" }

Example User Message: "Hello there!"
Example Output: { "response": "Hi! How can I help you customize your riddles today?", "intent": "chit_chat" }

Example User Message: "What's the weather like?"
Example Output: { "response": "Sorry, I can only help with changing riddle difficulty or topic.", "intent": "unknown" }

User Message: "{{message}}"
`,
});

// Define the Genkit flow
const chatWithRiddleBotFlow = ai.defineFlow<
  typeof ChatInputSchema,
  typeof ChatOutputSchema
>(
  {
    name: 'chatWithRiddleBotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatWithRiddleBotPrompt(input);

    // Ensure output is not null/undefined before returning
    if (!output) {
        // Provide a default fallback or throw an error
        console.error('Chatbot flow received null output from prompt.');
        return {
            response: "Sorry, I encountered an issue. Could you please rephrase?",
            intent: 'unknown', // Use the defined enum value
        };
    }
    // Ensure the intent is one of the allowed enum values, default to 'unknown' if not.
    const validIntent = IntentEnum.safeParse(output.intent);
    const finalIntent = validIntent.success ? validIntent.data : IntentEnum.enum.unknown;

    return {
        ...output,
        intent: finalIntent,
    };
  }
);
