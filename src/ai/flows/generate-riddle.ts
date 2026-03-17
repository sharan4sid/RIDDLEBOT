'use server';

export type GenerateRiddleInput = {
  constraints: string;
};

export type GenerateRiddleOutput = {
  riddle: string;
  answer: string;
  hint: string;
  alternativeAnswers?: string[]; // other accepted correct answers
};

// ─── Built-in riddle bank ─────────────────────────────────────────────────────
const RIDDLE_BANK: GenerateRiddleOutput[] = [
  {
    riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    answer: "An echo",
    alternativeAnswers: ["echo"],
    hint: "Think about sound bouncing back to you."
  },
  {
    riddle: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?",
    answer: "A map",
    alternativeAnswers: ["map", "a atlas", "atlas"],
    hint: "I show you places but can't take you there."
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps",
    alternativeAnswers: ["steps", "a footstep", "footstep", "tracks", "footprints", "a footprint"],
    hint: "Think about what happens when you walk."
  },
  {
    riddle: "I have hands but cannot clap. What am I?",
    answer: "A clock",
    alternativeAnswers: ["clock", "a watch", "watch", "a timepiece", "timepiece"],
    hint: "I help you keep track of something important each day."
  },
  {
    riddle: "I'm light as a feather, but even the strongest person can't hold me for more than a few minutes. What am I?",
    answer: "Breath",
    alternativeAnswers: ["air", "breathing", "your breath", "a breath"],
    hint: "You do this automatically every few seconds."
  },
  {
    riddle: "What has teeth but cannot bite?",
    answer: "A comb",
    alternativeAnswers: ["comb", "a gear", "gear", "a zipper", "zipper", "a saw", "saw"],
    hint: "You use this to keep yourself looking neat."
  },
  {
    riddle: "I have a head and a tail but no body. What am I?",
    answer: "A coin",
    alternativeAnswers: ["coin", "a penny", "penny"],
    hint: "You might flip me to make a decision."
  },
  {
    riddle: "What gets wetter the more it dries?",
    answer: "A towel",
    alternativeAnswers: ["towel", "a cloth", "cloth", "a sponge", "sponge", "a rag", "rag"],
    hint: "You use me after a shower."
  },
  {
    riddle: "I go up but never come down. What am I?",
    answer: "Age",
    alternativeAnswers: ["your age", "one's age"],
    hint: "Everyone has this, and it only moves in one direction."
  },
  {
    riddle: "What has four legs in the morning, two legs in the afternoon, and three legs in the evening?",
    answer: "A human",
    alternativeAnswers: ["human", "a person", "person", "man", "a man", "humans", "people"],
    hint: "This is the famous Sphinx riddle — think about stages of life."
  },
  {
    riddle: "The more you remove from me, the bigger I become. What am I?",
    answer: "A hole",
    alternativeAnswers: ["hole"],
    hint: "Digging creates more of me."
  },
  {
    riddle: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
    answer: "A river",
    alternativeAnswers: ["river", "a stream", "stream", "a creek", "creek"],
    hint: "I flow through landscapes and carve canyons."
  },
  {
    riddle: "I am always in front of you but can never be seen. What am I?",
    answer: "The future",
    alternativeAnswers: ["future", "tomorrow"],
    hint: "Time holds the answer."
  },
  {
    riddle: "What has one eye but cannot see?",
    answer: "A needle",
    alternativeAnswers: ["needle", "a sewing needle"],
    hint: "Tailors and seamstresses use me every day."
  },
  {
    riddle: "I shrink every time I am used. What am I?",
    answer: "A candle",
    alternativeAnswers: ["candle", "soap", "a bar of soap", "a pencil", "pencil", "chalk", "an eraser", "eraser"],
    hint: "I provide light, but at a cost."
  },
  {
    riddle: "What belongs to you but others use it more than you do?",
    answer: "Your name",
    alternativeAnswers: ["name", "my name", "a name"],
    hint: "People call out for you using this."
  },
  {
    riddle: "I have branches, but no fruit, no trunk, and no leaves. What am I?",
    answer: "A bank",
    alternativeAnswers: ["bank", "a library", "library"],
    hint: "You might keep your savings here."
  },
  {
    riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "The letter M",
    alternativeAnswers: ["letter m", "m", "the letter m", "m letter"],
    hint: "Look closely at the words in the riddle itself."
  },
  {
    riddle: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
    answer: "Fire",
    alternativeAnswers: ["a fire", "flame", "a flame", "flames"],
    hint: "I am hot and bright, but fragile."
  },
  {
    riddle: "I have no wings but I fly. I have no feet but I run. I have no mouth but I tell the time. What am I?",
    answer: "A clock",
    alternativeAnswers: ["clock", "a watch", "watch", "time"],
    hint: "You check me many times a day."
  },
];

const TOPIC_RIDDLES: Record<string, GenerateRiddleOutput[]> = {
  nature: [
    {
      riddle: "I fall in winter, spring brings my end. I cover the ground and make children grin. What am I?",
      answer: "Snow",
      alternativeAnswers: ["snowflake", "snowflakes", "a snowflake"],
      hint: "Cold, white, and wonderful for snowball fights."
    },
    {
      riddle: "I have needles but cannot sew. I stay green in winter's snow. What am I?",
      answer: "A pine tree",
      alternativeAnswers: ["pine tree", "a fir tree", "fir tree", "an evergreen", "evergreen", "a conifer", "conifer"],
      hint: "I'm a common Christmas decoration."
    },
    {
      riddle: "What can fill a room but takes up no space?",
      answer: "Light",
      alternativeAnswers: ["sunlight", "sunshine", "a light"],
      hint: "The sun provides me for free."
    },
  ],
  animals: [
    {
      riddle: "I have a mane but I'm not a lion. I have hooves but I'm not a cow. I carry people but I'm not a camel. What am I?",
      answer: "A horse",
      alternativeAnswers: ["horse", "a stallion", "stallion", "a mare", "mare"],
      hint: "Cowboys and knights rode me into battle."
    },
    {
      riddle: "I have eight legs, spin silk, and catch my dinner in a net. What am I?",
      answer: "A spider",
      alternativeAnswers: ["spider"],
      hint: "Some people find me frightening, but I eat insects."
    },
    {
      riddle: "I'm black and white and loved by many, but I'm picky about my bamboo diet. What am I?",
      answer: "A panda",
      alternativeAnswers: ["panda", "a giant panda", "giant panda"],
      hint: "I'm the symbol of a famous wildlife organization."
    },
  ],
  science: [
    {
      riddle: "I have no mass, travel at the fastest possible speed, and can illuminate the darkest room. What am I?",
      answer: "Light",
      alternativeAnswers: ["a photon", "photon", "sunlight", "electromagnetic radiation"],
      hint: "Einstein studied how I behave."
    },
    {
      riddle: "I am the force that keeps your feet on the ground and the planets in orbit. What am I?",
      answer: "Gravity",
      alternativeAnswers: ["gravitational force", "gravitational pull"],
      hint: "An apple falling inspired a famous scientist to study me."
    },
    {
      riddle: "I am made of two hydrogen atoms and one oxygen atom. What am I?",
      answer: "Water",
      alternativeAnswers: ["h2o", "h₂o", "a water molecule"],
      hint: "You drink me every day to stay alive."
    },
  ],
  history: [
    {
      riddle: "I was built to reach the heavens in ancient Mesopotamia. I am a terraced temple. What am I?",
      answer: "A ziggurat",
      alternativeAnswers: ["ziggurat"],
      hint: "The Tower of Babel may have been one of me."
    },
    {
      riddle: "I am the longest wall ever built by human hands, stretching thousands of miles. What am I?",
      answer: "The Great Wall of China",
      alternativeAnswers: ["great wall of china", "great wall", "the great wall"],
      hint: "Emperors built me to keep invaders out."
    },
    {
      riddle: "I sailed three ships westward and stumbled upon a continent I didn't expect. Who am I?",
      answer: "Christopher Columbus",
      alternativeAnswers: ["columbus", "cristopher columbus", "cristoforo colombo"],
      hint: "I sailed in 1492."
    },
  ],
  food: [
    {
      riddle: "I am yellow on the outside, sweet on the inside, and monkeys love me. What am I?",
      answer: "A banana",
      alternativeAnswers: ["banana"],
      hint: "You peel me before eating."
    },
    {
      riddle: "I am round and cheesy, come in slices, and am topped with your favorite things. What am I?",
      answer: "Pizza",
      alternativeAnswers: ["a pizza", "a pie", "pie"],
      hint: "Italy gave me to the world."
    },
    {
      riddle: "I am sweet, come in many flavors, and melt if you don't eat me fast enough. What am I?",
      answer: "Ice cream",
      alternativeAnswers: ["icecream", "ice-cream", "a gelato", "gelato", "frozen dessert"],
      hint: "Hot summer days call for me."
    },
  ],
};

function getLocalRiddle(constraints: string): GenerateRiddleOutput {
  const lower = constraints.toLowerCase();
  for (const [topic, riddles] of Object.entries(TOPIC_RIDDLES)) {
    if (lower.includes(topic)) {
      return riddles[Math.floor(Math.random() * riddles.length)];
    }
  }
  return RIDDLE_BANK[Math.floor(Math.random() * RIDDLE_BANK.length)];
}

// ─── Gemini API ───────────────────────────────────────────────────────────────
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(apiKey: string, model: string, prompt: string): Promise<GenerateRiddleOutput | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 600,
        },
      }),
    }
  );

  if (response.status === 429) throw new Error('RATE_LIMIT');
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API_ERROR:${response.status} Details: ${errorText}`);
    throw new Error(`API_ERROR:${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const clean = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean) as GenerateRiddleOutput;
  if (!parsed.riddle || !parsed.answer || !parsed.hint) return null;

  // Normalize alternativeAnswers to always be an array
  if (!Array.isArray(parsed.alternativeAnswers)) {
    parsed.alternativeAnswers = [];
  }

  return parsed;
}

export async function generateRiddle(input: GenerateRiddleInput): Promise<GenerateRiddleOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  const constraints = input.constraints?.trim() ?? '';

  if (!apiKey) {
    console.warn('GOOGLE_GENAI_API_KEY not set — using local riddle bank.');
    return getLocalRiddle(constraints);
  }

  const constraintText = constraints
    ? `Apply these constraints: ${constraints}`
    : 'Generate a general riddle of medium difficulty.';

  const prompt = `You are a master riddle generator for the Prahelika Game. Generate a single, engaging riddle and respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

${constraintText}

Requirements:
1. The riddle must strictly belong to the user-selected topic (if a topic is specified).
2. The riddle difficulty must match the selected difficulty level (if specified). Adjust the complexity accordingly:
   * Easy: Simple riddle, obvious clues, answer can be guessed quickly.
   * Medium: Moderate thinking required, indirect clues.
   * Hard: Tricky, abstract clues requiring deeper thinking.
3. Ensure riddles are unique, creative, and relevant to the topic.
4. The primary answer should be the most natural phrasing (e.g. "A map").
5. alternativeAnswers must include ALL other reasonable ways someone might correctly answer the riddle. Think of:
   * The answer without the article (e.g. "map" if answer is "A map")
   * Synonyms (e.g. "a clock", "watch", "timepiece")
   * Plural/singular variants
   * Common misspellings or alternate spellings
   * Related correct answers (e.g. if answer is "fire", also include "flame", "flames")
   Include at least 2-4 alternatives.

Respond with exactly this JSON structure:
{
  "riddle": "the riddle text here",
  "answer": "the most natural answer phrasing",
  "hint": "a helpful hint here",
  "alternativeAnswers": ["alt answer 1", "alt answer 2", "alt answer 3"]
}`;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await callGemini(apiKey, model, prompt);
        if (result) return result;
        break;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg === 'RATE_LIMIT') {
          if (attempt < 2) { await sleep(2000); continue; }
          break;
        }
        console.error(`Error on ${model}:`, msg);
        break;
      }
    }
  }

  console.warn('Gemini API unavailable — falling back to local riddle bank.');
  return getLocalRiddle(constraints);
}
