// js/game.js

// Game State Variables
let score = 0;
let attempts = 3;
let currentRiddleIndex = 0;
let questionNumber = 1;
let hintUsed = false;
let availableRiddles = [];
let currentRiddle = null;
const TOTAL_QUESTIONS = 5;

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const completionScreen = document.getElementById('completion-screen');

const categorySelect = document.getElementById('category-select');
const difficultySelect = document.getElementById('difficulty-select');
const startBtn = document.getElementById('start-btn');
const setupError = document.getElementById('setup-error');

const riddleCounter = document.getElementById('riddle-counter');
const riddleText = document.getElementById('riddle-text');
const attemptsDisplay = document.getElementById('attempts-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const hintBtn = document.getElementById('hint-btn');
const hintSection = document.getElementById('hint-section');
const hintText = document.getElementById('hint-text');
const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('score-display');

const finalScore = document.getElementById('final-score');
const completionMessage = document.getElementById('completion-message');
const restartBtn = document.getElementById('restart-btn');

// Points configuration
const POINTS = {
    "Easy": 10,
    "Medium": 20,
    "Hard": 30
};

// Event Listeners
if (startBtn) startBtn.addEventListener('click', startGame);
if (submitBtn) submitBtn.addEventListener('click', checkAnswer);
if (nextBtn) nextBtn.addEventListener('click', nextRiddle);
if (hintBtn) hintBtn.addEventListener('click', showHint);
if (restartBtn) restartBtn.addEventListener('click', resetGame);

// Allow pressing Enter to submit
if (answerInput) {
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            checkAnswer();
        }
    });
}

/**
 * Starts the game by filtering riddles and setting up the initial state
 */
function startGame() {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    
    // Filter riddles based on user selection
    availableRiddles = riddles.filter(r => r.category === category && r.difficulty === difficulty);
    
    if (availableRiddles.length === 0) {
        setupError.textContent = "No riddles are available for this selection. Please choose another category or difficulty.";
        setupError.classList.remove('hidden');
        return;
    }
    
    setupError.classList.add('hidden');
    
    // Reset Game State
    score = 0;
    questionNumber = 1;
    
    // Switch screens
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    loadRiddle();
}

/**
 * Loads a random riddle from the available pool
 */
function loadRiddle() {
    // Select a random riddle
    const randomIndex = Math.floor(Math.random() * availableRiddles.length);
    currentRiddle = availableRiddles[randomIndex];
    
    // Setup UI for the new riddle
    attempts = 3;
    hintUsed = false;
    
    riddleCounter.textContent = questionNumber;
    riddleText.textContent = currentRiddle.question;
    attemptsDisplay.textContent = `${attempts}/3`;
    scoreDisplay.textContent = score;
    
    // Reset inputs and buttons
    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.focus();
    
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = false;
    nextBtn.classList.add('hidden');
    
    hintBtn.disabled = false;
    hintSection.classList.add('hidden');
    
    feedbackMessage.textContent = "";
    feedbackMessage.className = "feedback-msg";
}

/**
 * Validates the user's answer
 */
function checkAnswer() {
    let userAnswer = answerInput.value;
    
    // Normalize input: lowercase, remove leading/trailing spaces, and handle multiple spaces
    userAnswer = userAnswer.toLowerCase().trim().replace(/\s+/g, ' ');
    
    if (userAnswer === "") {
        setFeedback("Please enter an answer.", "feedback-warning");
        return;
    }
    
    const correctAnswer = currentRiddle.answer.toLowerCase();
    
    if (userAnswer === correctAnswer) {
        // Correct Answer
        let pointsEarned = POINTS[currentRiddle.difficulty] || 10;
        
        // Deduct half points if hint was used
        if (hintUsed) {
            pointsEarned = Math.floor(pointsEarned / 2);
        }
        
        score += pointsEarned;
        scoreDisplay.textContent = score;
        
        setFeedback(`Correct! You earned ${pointsEarned} points.`, "feedback-correct");
        endRiddleSession();
    } else {
        // Incorrect Answer
        attempts--;
        attemptsDisplay.textContent = `${attempts}/3`;
        
        if (attempts > 0) {
            setFeedback("Incorrect. Try again!", "feedback-incorrect");
            // Clear input for another try
            answerInput.value = "";
            answerInput.focus();
        } else {
            // Out of attempts
            setFeedback(`Out of attempts. The correct answer was: ${currentRiddle.answer}`, "feedback-incorrect");
            endRiddleSession();
        }
    }
}

/**
 * Displays the hint for the current riddle
 */
function showHint() {
    if (!hintUsed) {
        hintUsed = true;
        hintText.textContent = `Hint: ${currentRiddle.hint}`;
        hintSection.classList.remove('hidden');
        hintBtn.disabled = true;
    }
}

/**
 * Disables inputs and shows the Next Riddle button
 */
function endRiddleSession() {
    answerInput.disabled = true;
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    hintBtn.disabled = true;
    
    // Remove the current riddle from the pool so it doesn't repeat immediately
    // If we only have 1 riddle left, we might have to reuse it or just let the array be empty
    if (availableRiddles.length > 1) {
        availableRiddles = availableRiddles.filter(r => r.id !== currentRiddle.id);
    }
}

/**
 * Proceeds to the next riddle or ends the game if 5 riddles are reached
 */
function nextRiddle() {
    if (questionNumber >= TOTAL_QUESTIONS) {
        endGame();
    } else {
        questionNumber++;
        loadRiddle();
    }
}

/**
 * Ends the game and displays the completion screen
 */
function endGame() {
    gameScreen.classList.add('hidden');
    completionScreen.classList.remove('hidden');
    
    finalScore.textContent = score;
    
    // Provide a simple performance message
    if (score > 100) {
        completionMessage.textContent = "Outstanding performance! You are a riddle master.";
    } else if (score > 50) {
        completionMessage.textContent = "Great job! You have a sharp mind.";
    } else if (score > 0) {
        completionMessage.textContent = "Good effort! Keep practicing your riddle solving skills.";
    } else {
        completionMessage.textContent = "Better luck next time! Every riddle solved is a lesson learned.";
    }
}

/**
 * Resets the game to the initial setup screen
 */
function resetGame() {
    completionScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    
    // Reset all game state variables
    score = 0;
    attempts = 3;
    questionNumber = 1;
    hintUsed = false;
    currentRiddle = null;
    
    // Reset UI
    setupError.classList.add('hidden');
}

/**
 * Helper function to display feedback messages
 */
function setFeedback(message, className) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-msg ${className}`;
}
