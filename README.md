# prahelikā Game (Riddlebot)

Welcome to the **prahelikā Game**! A modern, web-based riddle game where you can test your wit against our AI Riddle Master. Powered by Google Genkit and Gemini API, the game generates dynamic, topic-based riddles to challenge you. If the AI is busy, there is a built-in riddle bank ready to take over.

## 🚀 Features

- **AI-Generated Riddles**: Dynamic, engaging riddles powered by `gemini-1.5-flash`.
- **Custom Constraints**: Request riddles based on specific topics (e.g., Nature, Science, History, Animals, Food).
- **Graceful Fallback**: A built-in local riddle bank ensures continuous gameplay if the AI API is rate-limited or unavailable.
- **Modern UI**: Fully responsive and accessible interface built with Tailwind CSS and Radix UI.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Version 15, Turbopack)
- **Library**: [React](https://reactjs.org/) 18
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **AI Infrastructure**: [Google Genkit](https://github.com/firebase/genkit) (`@genkit-ai/googleai`)
- **Backend/Data**: [Firebase](https://firebase.google.com/)

## 🏁 Getting Started

To get a local instance running, follow these simple steps:

### 1. Installation

First, clone the repository and install the dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your Google Gemini API key:

```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

## 🧠 Playing the Game

- Click "**Get Started**" to fetch your first riddle.
- Use the input field to guess the answer.
- Need help? Features like requesting a hint or switching topics are readily available.
- If the AI gets overloaded, the application will automatically fall back to its curated riddle bank.

---
