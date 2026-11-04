# prahelikā (Version 3) — AI-Powered Riddle Platform

Prahelikā is a modern, intelligent full-stack riddle platform built with Node.js, Express, React (Vite), MongoDB, and Google's official Gemini Generative AI SDK (`@google/genai`).

---

## 🌟 Version 3 Highlights

1. **AI-Generated Riddles**:
   - Generate original, solvable riddles dynamically on demand by Category, Difficulty (`Easy`, `Medium`, `Hard`, `Expert`), and optional custom Theme/Topic.
   - Structured JSON validation ensuring questions never leak answers, and hints progress appropriately.
2. **Progressive Hints (3 Levels)**:
   - **Level 1**: Gentle nudge and metaphorical direction.
   - **Level 2**: Specific clue narrowing down attributes and domain.
   - **Level 3**: Strong direct clue approaching the solution without giving away the answer.
3. **Intelligent Semantic Answer Evaluation**:
   - Multi-tier answer evaluation: exact matches → accepted synonyms/alternatives → AI semantic equivalence check for phrasing variations.
4. **Educational Explanations**:
   - Post-solve explanations breaking down the reasoning and metaphorical clues.
5. **Grounded Riddle AI Companion**:
   - Contextual chat interface allowing players to ask questions about confusing clues, terms, or context. Strictly guarded against prompt injection and answer leakage.
6. **Personalized Challenges**:
   - Dynamic recommendation engine analyzing past win rates and streaks to suggest customized categories and difficulty levels.
7. **Robust MongoDB Fallback**:
   - Seamless offline/fallback mode using curated database riddles and deterministic regex/normalized matching whenever Gemini API is unreachable or rate-limited.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Custom CSS (zero external UI/CSS frameworks)
- **Backend**: Node.js, Express, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `@google/genai`
- **Database**: MongoDB (Mongoose ODM)
- **AI Model**: Google Gemini (`gemini-2.5-flash` or configurable via environment)

---

## 🚀 Getting Started

### 1. Environment Configuration

In `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prahelika
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Note**: If `GEMINI_API_KEY` is omitted or empty, the entire application gracefully falls back to the local MongoDB riddle database without interruption.

### 2. Backend Setup & Seeding

```bash
cd server
npm install
npm run seed     # Seeds 24+ classic riddles, achievements, and admin account
npm test         # Executes automated AI service test suite
npm run dev      # Starts Express backend on http://localhost:5000
```

*Default Admin Account*: `admin@prahelika.com` / `admin123`

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev      # Starts Vite React frontend on http://localhost:5173
```

---

## 🧪 Testing

Execute automated unit and integration tests for the AI service:
```bash
cd server
npm test
```
Verifies answer normalization, schema validation, prompt sanitization, progressive hints, semantic evaluation, chat guardrails, personalized recommendation, and scoring formulas.
