'use server';

export type ChatInput = {
  message: string;
};

export type ChatOutput = {
  response: string;
  intent: 'difficulty' | 'topic' | 'chit_chat' | 'unknown';
  value?: string;
};

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Simple local intent parser (no API needed) ───────────────────────────────
function parseIntentLocally(message: string): ChatOutput {
  const lower = message.toLowerCase().trim();

  // Difficulty detection
  if (/\b(easy|simple|beginner|basic|child|kid)\b/.test(lower)) {
    return { response: "Got it! Setting difficulty to easy. Enjoy the simpler riddles!", intent: 'difficulty', value: 'easy' };
  }
  if (/\b(medium|normal|moderate|intermediate)\b/.test(lower)) {
    return { response: "Sure! Setting difficulty to medium.", intent: 'difficulty', value: 'medium' };
  }
  if (/\b(hard|difficult|tough|challenging|expert|advanced)\b/.test(lower)) {
    return { response: "Challenge accepted! Setting difficulty to hard.", intent: 'difficulty', value: 'hard' };
  }

  // Topic detection
  const topics = ['animals', 'science', 'history', 'food', 'technology', 'nature', 'sports', 'movies', 'music', 'geography'];
  for (const topic of topics) {
    if (lower.includes(topic)) {
      return { response: `Great choice! The next riddle will be about ${topic}.`, intent: 'topic', value: topic };
    }
  }

  // Greetings
  if (/^(hi|hello|hey|howdy|greetings|sup|what'?s up)/i.test(lower)) {
    return { response: "Hi there! 👋 Ask me to change the riddle's difficulty (easy, medium, hard) or topic (e.g., animals, science).", intent: 'chit_chat' };
  }

  // Thanks
  if (/\b(thanks|thank you|cheers|great|awesome|cool)\b/.test(lower)) {
    return { response: "You're welcome! Let me know if you want to change the difficulty or topic.", intent: 'chit_chat' };
  }

  return {
    response: "I can help you change the riddle difficulty (easy, medium, hard) or topic (e.g., animals, science, history). What would you like?",
    intent: 'unknown',
  };
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<ChatOutput | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (response.status === 429) throw new Error('RATE_LIMIT');
  if (!response.ok) throw new Error(`API_ERROR:${response.status}`);

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const clean = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean) as ChatOutput;
  if (!parsed.response || !parsed.intent) return null;
  return parsed;
}

export async function chatWithRiddleBot(input: ChatInput): Promise<ChatOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  // No API key — use local parser silently
  if (!apiKey) {
    console.warn('GOOGLE_GENAI_API_KEY not set — using local intent parser.');
    return parseIntentLocally(input.message);
  }

  const prompt = `You are a friendly chatbot for the "prahelikā" riddle game. Help users change riddle difficulty or topic.

User's message: "${input.message.replace(/"/g, "'")}"

Respond ONLY with valid JSON — no markdown, no extra text:
{
  "response": "your friendly reply",
  "intent": "difficulty" | "topic" | "chit_chat" | "unknown",
  "value": "easy/medium/hard OR topic name (only for difficulty/topic intents)"
}`;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await callGemini(apiKey, model, prompt);
        if (!result) break;

        const validIntents = ['difficulty', 'topic', 'chit_chat', 'unknown'] as const;
        const intent = validIntents.includes(result.intent as typeof validIntents[number])
          ? result.intent : 'unknown';

        return {
          response: result.response,
          intent,
          value: (intent === 'difficulty' || intent === 'topic') && result.value
            ? result.value.toLowerCase() : undefined,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg === 'RATE_LIMIT') {
          if (attempt < 2) { await sleep(2000); continue; }
          break;
        }
        console.error(`Chatbot error on ${model}:`, msg);
        break;
      }
    }
  }

  // API unavailable — fall back to local parser
  console.warn('Gemini API unavailable — using local intent parser.');
  return parseIntentLocally(input.message);
}
