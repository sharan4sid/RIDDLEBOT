# prahelikā - An AI-Powered Riddle Game

![prahelikā Screenshot](https://placehold.co/800x400.png?text=prahelikā+App+Screenshot)
*<p align="center">A fun and interactive riddle-solving game built with Next.js and Google's Genkit.</p>*

---

## ✨ Features

- **Dynamic Riddle Generation**: Leverages Google's generative AI via Genkit to create unique riddles on demand.
- **Interactive Riddle Solver**: Guess the answer, get hints, and see how many tries you have left.
- **AI Chatbot Assistant**: Chat with a bot to change the riddle's difficulty (`easy`, `medium`, `hard`) or topic (e.g., `animals`, `science`, `history`).
- **Responsive Design**: A clean and modern UI that works seamlessly across desktop and mobile devices.
- **Theming**: Switch between beautiful, custom-designed Light (Soft Sky) and Dark (Nocturne Bloom) modes.
- **Context-Aware**: The app uses React Context to manage the state of riddle constraints across different components.

## 🛠️ Tech Stack

This project is built with a modern, type-safe, and performant technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit) (with Google AI)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context
- **Forms**: React Hook Form with Zod for validation

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add your Google AI API key:
    ```env
    GOOGLE_GENAI_API_KEY=your_google_api_key_here
    ```
    You can obtain a key from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

1.  **Start the development server:**
    This command starts the Next.js application.
    ```bash
    npm run dev
    ```

2.  **Start the Genkit development server (in a separate terminal):**
    This command starts the Genkit flows, which are required for the AI features to work.
    ```bash
    npm run genkit:watch
    ```

3.  **Open your browser:**
    Navigate to [http://localhost:9002](http://localhost:9002) (or the port specified in your terminal) to see the application.

## 📂 Project Structure

- `src/app/`: Contains the main pages of the application (Game, Home, About).
- `src/ai/`: Houses all the Genkit-related code.
  - `flows/`: Defines the AI flows for generating riddles and chatting with the bot.
- `src/components/`: Includes reusable React components.
  - `ui/`: Contains the ShadCN UI components.
- `src/context/`: Holds the React Context providers (e.g., `RiddleContext`).
- `src/lib/`: Utility functions.
- `src/hooks/`: Custom React hooks.
