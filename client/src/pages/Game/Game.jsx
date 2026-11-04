// client/src/pages/Game/Game.jsx
// Version 3: AI-Powered Riddle Platform with Complete V1 & V2 Preservation

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './Game.css';

// Fallback riddles dataset if offline or unauthenticated
const FALLBACK_RIDDLES = [
  { id: 'fb1', question: "What has to be broken before you can use it?", answer: "egg", category: "General Knowledge", difficulty: "Easy", hint: "It has a shell and a yolk.", hints: ["Think about morning breakfast.", "It has a fragile shell.", "Break it open to cook the yolk and white."], explanation: "An egg must have its shell cracked/broken open before cooking or eating." },
  { id: 'fb2', question: "I have cities, but no houses. I have mountains, but no trees. What am I?", answer: "map", category: "General Knowledge", difficulty: "Medium", hint: "You use it to navigate.", hints: ["It represents geography on a flat surface.", "Cartographers draw them.", "You fold it up to fit in your pocket."], explanation: "A map depicts cities, rivers, and mountains symbolically without physical objects." },
  { id: 'fb3', question: "What disappears as soon as you say its name?", answer: "silence", category: "General Knowledge", difficulty: "Hard", hint: "It's the absence of sound.", hints: ["Speaking directly ends it.", "It is golden in an old proverb.", "Any sound destroys it."], explanation: "Speaking breaks silence; uttering the word itself creates sound." },
  { id: 'fb4', question: "What can fill a room but takes up no space?", answer: "light", category: "Science", difficulty: "Easy", hint: "It comes from the sun or a bulb.", hints: ["It enters through windows.", "It travels at 300,000 km/s.", "Photons illuminate darkness."], explanation: "Light fills the entire volume of a room without displacing physical matter." },
  { id: 'fb5', question: "What has a bank but no money?", answer: "river", category: "Nature", difficulty: "Easy", hint: "Water flows through it.", hints: ["It flows towards the sea.", "It has a current and a bed.", "Its edges are called riverbanks."], explanation: "A river has riverbanks on either side, which are physical land borders, not financial vaults." }
];

export function Game() {
  const { isAuthenticated } = useAuth();

  // Step: 'setup' | 'play' | 'completion'
  const [step, setStep] = useState('setup');

  // Game Mode: 'classic' | 'ai'
  const [gameMode, setGameMode] = useState('ai');
  const [category, setCategory] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [setupError, setSetupError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active game session state
  const [riddles, setRiddles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [isAnswered, setIsAnswered] = useState(false);

  // Progressive Hints State (Levels 1, 2, 3)
  const [unlockedHints, setUnlockedHints] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);

  // Explanation State
  const [explanation, setExplanation] = useState('');

  // AI Chat Assistant State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // V2 & V3 Scoring & Mechanics
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [riddlesSolved, setRiddlesSolved] = useState(0);
  const [hintsUsedTotal, setHintsUsedTotal] = useState(0);

  // Timers
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [riddleSeconds, setRiddleSeconds] = useState(0);
  const timerRef = useRef(null);

  // Results & Achievements
  const [newAchievements, setNewAchievements] = useState([]);

  // Fetch AI Recommendation on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.getAIPersonalizedRecommendation()
        .then(rec => {
          if (rec && rec.recommendedCategory) {
            setRecommendation(rec);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Start session timer when playing
  useEffect(() => {
    if (step === 'play') {
      timerRef.current = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
        setRiddleSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  function applyRecommendation() {
    if (recommendation) {
      if (recommendation.recommendedCategory) setCategory(recommendation.recommendedCategory);
      if (recommendation.recommendedDifficulty) setDifficulty(recommendation.recommendedDifficulty);
      if (recommendation.recommendedTopic) setTopic(recommendation.recommendedTopic);
    }
  }

  // Handle game setup & riddle loading
  async function handleStartGame() {
    setLoading(true);
    setSetupError('');

    try {
      let loadedRiddles = [];

      if (gameMode === 'ai' && isAuthenticated) {
        // Version 3: AI Riddle Generation
        try {
          const aiData = await api.generateAIRiddles({
            category,
            difficulty,
            count: 5,
            topic: topic.trim()
          });
          loadedRiddles = aiData.riddles || [];
        } catch (aiErr) {
          console.warn('AI riddle generation failed, falling back to database:', aiErr);
        }
      }

      // If classic mode OR if AI generation fell back, fetch from DB
      if (loadedRiddles.length === 0 && isAuthenticated) {
        const catParam = category === 'General Knowledge' ? '' : category;
        const dbData = await api.getRiddles(catParam, difficulty, 5);
        loadedRiddles = dbData.riddles || [];
      }

      // Fallback filtering if still empty or guest mode
      if (loadedRiddles.length === 0) {
        loadedRiddles = FALLBACK_RIDDLES.filter(r =>
          (category === 'General Knowledge' || r.category === category) && r.difficulty === difficulty
        );
      }

      if (loadedRiddles.length === 0) {
        loadedRiddles = FALLBACK_RIDDLES;
      }

      setRiddles(loadedRiddles);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setRiddlesSolved(0);
      setHintsUsedTotal(0);
      setSessionSeconds(0);
      setNewAchievements([]);

      resetRiddleTurn(loadedRiddles[0]);
      setStep('play');
    } catch (error) {
      console.error('Start game error:', error);
      setSetupError('Failed to load riddles. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetRiddleTurn(riddleObj) {
    setAttempts(3);
    setUserAnswer('');
    setFeedback({ text: '', type: '' });
    setIsAnswered(false);
    setRiddleSeconds(0);
    setExplanation('');
    setShowChat(false);
    setChatMessages([]);
    setChatInput('');

    // Progressive hints
    setUnlockedHints([]);
    setHintLevel(0);
  }

  // Request Progressive Hint (Level 1, 2, or 3)
  async function handleRequestProgressiveHint() {
    const nextLevel = hintLevel + 1;
    if (nextLevel > 3 || isAnswered || hintLoading) return;

    setHintLoading(true);
    const currentRiddle = riddles[currentIndex];
    const riddleId = currentRiddle._id || currentRiddle.id;

    try {
      let hintText = '';

      if (isAuthenticated && riddleId) {
        const data = await api.getAIProgressiveHint(riddleId, nextLevel, currentRiddle);
        hintText = data.hint;
      } else if (currentRiddle.hints && currentRiddle.hints[nextLevel - 1]) {
        hintText = currentRiddle.hints[nextLevel - 1];
      } else {
        hintText = currentRiddle.hint || 'Think carefully about each clue.';
      }

      setUnlockedHints(prev => [...prev, { level: nextLevel, text: hintText }]);
      setHintLevel(nextLevel);
      setHintsUsedTotal(prev => prev + 1);
    } catch (err) {
      console.error('Hint retrieval error:', err);
      // Fallback local hint
      const fallbackHint = currentRiddle.hint || 'Consider alternative meanings.';
      setUnlockedHints(prev => [...prev, { level: nextLevel, text: fallbackHint }]);
      setHintLevel(nextLevel);
    } finally {
      setHintLoading(false);
    }
  }

  // Handle answer submission
  async function handleSubmitAnswer() {
    if (!userAnswer.trim()) {
      setFeedback({ text: 'Please enter an answer.', type: 'feedback-warning' });
      return;
    }

    const currentRiddle = riddles[currentIndex];
    const riddleId = currentRiddle._id || currentRiddle.id;
    const isFinal = attempts - 1 <= 0;

    let isCorrect = false;
    let feedbackText = '';
    let revealedAnswer = '';
    let revealedExplanation = '';

    if (isAuthenticated && riddleId) {
      try {
        const res = await api.evaluateAIAnswer(riddleId, userAnswer, isFinal, currentRiddle);
        isCorrect = res.isCorrect;
        feedbackText = res.feedback;
        if (res.correctAnswer) revealedAnswer = res.correctAnswer;
        if (res.explanation) revealedExplanation = res.explanation;
      } catch (err) {
        // Local evaluation fallback
        const cleanUser = userAnswer.toLowerCase().trim().replace(/^(a|an|the)\s+/, '');
        const cleanAns = (currentRiddle.answer || '').toLowerCase().trim().replace(/^(a|an|the)\s+/, '');
        isCorrect = cleanUser === cleanAns;
        feedbackText = isCorrect ? 'Correct! 🎉' : 'Incorrect. Try again!';
      }
    } else {
      const cleanUser = userAnswer.toLowerCase().trim().replace(/^(a|an|the)\s+/, '');
      const cleanAns = (currentRiddle.answer || '').toLowerCase().trim().replace(/^(a|an|the)\s+/, '');
      isCorrect = cleanUser === cleanAns;
      feedbackText = isCorrect ? 'Correct! 🎉' : 'Incorrect. Try again!';
    }

    if (isCorrect) {
      // Version 2/3 Scoring: Base * Streak Multiplier + Time Bonus - Progressive Hint Deduction
      const basePoints = { Easy: 10, Medium: 20, Hard: 30, Expert: 40 }[difficulty] || 10;
      const streakMultiplier = Math.min(1 + streak * 0.5, 3);

      let timeBonus = 0;
      if (riddleSeconds <= 10) timeBonus = 5;
      else if (riddleSeconds <= 20) timeBonus = 3;
      else if (riddleSeconds <= 30) timeBonus = 1;

      let earned = Math.floor(basePoints * streakMultiplier) + timeBonus;

      // Deduct points proportionally if hints were used (10% per hint level)
      if (hintLevel > 0) {
        const deductionFactor = Math.max(0.5, 1 - (hintLevel * 0.15));
        earned = Math.floor(earned * deductionFactor);
      }

      const newScore = score + earned;
      const newStreak = streak + 1;
      const newMaxStreak = Math.max(maxStreak, newStreak);

      setScore(newScore);
      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setRiddlesSolved(prev => prev + 1);
      setIsAnswered(true);
      setFeedback({ text: feedbackText || `Correct! +${earned} points earned! 🎉`, type: 'feedback-correct' });

      // Fetch or set explanation
      fetchExplanation(currentRiddle, revealedExplanation);
    } else {
      const remaining = attempts - 1;
      setAttempts(remaining);

      if (remaining > 0) {
        setStreak(0); // Reset streak on incorrect answer
        setUserAnswer('');
        setFeedback({ text: feedbackText || `Incorrect. ${remaining} attempt(s) remaining!`, type: 'feedback-incorrect' });
      } else {
        setStreak(0);
        setIsAnswered(true);
        const displayAns = revealedAnswer || currentRiddle.answer || 'Unrevealed';
        setFeedback({ text: `Out of attempts! The answer was: "${displayAns}"`, type: 'feedback-incorrect' });

        // Reveal explanation
        fetchExplanation(currentRiddle, revealedExplanation);
      }
    }
  }

  async function fetchExplanation(riddleObj, cachedExpl) {
    if (cachedExpl) {
      setExplanation(cachedExpl);
      return;
    }
    if (riddleObj.explanation) {
      setExplanation(riddleObj.explanation);
      return;
    }

    const riddleId = riddleObj._id || riddleObj.id;
    if (isAuthenticated && riddleId) {
      try {
        const data = await api.getAIRiddleExplanation(riddleId, riddleObj);
        setExplanation(data.explanation || '');
      } catch (err) {
        setExplanation(`The answer "${riddleObj.answer}" fits the clues.`);
      }
    } else {
      setExplanation(`The answer "${riddleObj.answer}" fits the riddle clues.`);
    }
  }

  // Send Grounded Chat Message to AI Companion
  async function handleSendChatMessage(e) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    const currentRiddle = riddles[currentIndex];
    const riddleId = currentRiddle._id || currentRiddle.id;

    try {
      const res = await api.sendAIRiddleChat(
        riddleId,
        userMsg,
        chatMessages,
        isAnswered,
        currentRiddle
      );
      setChatMessages(prev => [...prev, { role: 'model', text: res.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'model',
        text: "I am having trouble answering right now. Re-read the clues and compare them with the hints!"
      }]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleNextRiddle() {
    if (currentIndex + 1 >= riddles.length) {
      finishGame();
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetRiddleTurn(riddles[nextIdx]);
    }
  }

  async function finishGame() {
    clearInterval(timerRef.current);
    setStep('completion');

    if (isAuthenticated) {
      try {
        const resultData = {
          score,
          category,
          difficulty,
          riddlesSolved,
          totalRiddles: riddles.length,
          timeTaken: sessionSeconds,
          maxStreak,
          hintsUsed: hintsUsedTotal,
          gameMode,
          topic: topic.trim()
        };

        const res = await api.saveGameResult(resultData);
        if (res.newAchievements && res.newAchievements.length > 0) {
          setNewAchievements(res.newAchievements);
        }
      } catch (err) {
        console.error('Failed to save game result:', err);
      }
    }
  }

  const currentRiddle = riddles[currentIndex] || {};

  return (
    <div className="container">
      <div className="game-container">

        {/* ============================================================ */}
        {/* 1. GAME SETUP SCREEN */}
        {/* ============================================================ */}
        {step === 'setup' && (
          <div>
            <div className="game-header">
              <h2>prahelikā Game</h2>
              <p>Challenge your mind with intelligent riddles</p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-tab-btn ${gameMode === 'classic' ? 'active' : ''}`}
                onClick={() => setGameMode('classic')}
              >
                📚 Classic Database
              </button>
              <button
                type="button"
                className={`mode-tab-btn ${gameMode === 'ai' ? 'active' : ''}`}
                onClick={() => setGameMode('ai')}
              >
                ✨ AI-Generated Riddles
              </button>
            </div>

            {/* Optional AI Recommendation pill */}
            {recommendation && gameMode === 'ai' && (
              <div style={{ marginBottom: '20px' }}>
                <button type="button" className="recommend-badge" onClick={applyRecommendation}>
                  🎯 AI Recommends: {recommendation.recommendedCategory} ({recommendation.recommendedDifficulty})
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="category-select">Category</label>
              <select
                id="category-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="General Knowledge">General Knowledge</option>
                <option value="Logic">Logic</option>
                <option value="Programming">Programming</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Science">Science</option>
                <option value="Nature">Nature</option>
                <option value="History">History</option>
                <option value="Animals">Animals</option>
                <option value="Technology">Technology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Wordplay">Wordplay</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty-select">Difficulty</label>
              <select
                id="difficulty-select"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy (10 pts)</option>
                <option value="Medium">Medium (20 pts)</option>
                <option value="Hard">Hard (30 pts)</option>
                <option value="Expert">Expert (40 pts)</option>
              </select>
            </div>

            {gameMode === 'ai' && (
              <div className="form-group">
                <label htmlFor="topic-input">Optional Topic / Theme</label>
                <input
                  id="topic-input"
                  type="text"
                  placeholder="e.g. Space exploration, Algorithms, Ancient Rome"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  maxLength={60}
                />
              </div>
            )}

            <button onClick={handleStartGame} className="btn" disabled={loading}>
              {loading ? 'Generating Challenge...' : 'Start Game'}
            </button>

            {setupError && <div className="feedback-msg feedback-incorrect">{setupError}</div>}
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ACTIVE GAMEPLAY SCREEN */}
        {/* ============================================================ */}
        {step === 'play' && (
          <div>
            <div className="game-header">
              <h2>prahelikā Game</h2>
              <p>Riddle {currentIndex + 1} of {riddles.length}</p>
            </div>

            {/* V2 / V3 Heads-Up-Display (HUD) */}
            <div className="game-hud">
              <div className="hud-item">
                ⏱️ Time: <strong>{sessionSeconds}s</strong>
              </div>
              <div className="hud-item">
                🔥 Streak: <strong>×{streak}</strong>
              </div>
              <div className="hud-item">
                🎯 Score: <strong>{score}</strong>
              </div>
            </div>

            <div className="riddle-display">
              {/* Category, Difficulty & AI Origin Tags */}
              <div className="riddle-meta-tags">
                <span className="badge badge-easy">{currentRiddle.category || category}</span>
                <span className={`badge badge-${(currentRiddle.difficulty || difficulty).toLowerCase()}`}>
                  {currentRiddle.difficulty || difficulty}
                </span>
                {currentRiddle.source === 'ai' && (
                  <span className="badge badge-expert">✨ AI Riddle</span>
                )}
                {currentRiddle.topic && (
                  <span className="badge badge-medium">🏷️ {currentRiddle.topic}</span>
                )}
              </div>

              <p className="riddle-text">{currentRiddle.question}</p>

              {/* Game Stats & Action Buttons */}
              <div className="game-stats">
                <span>Attempts: <strong>{attempts}/3</strong></span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRequestProgressiveHint}
                    className="btn btn-secondary"
                    disabled={hintLevel >= 3 || isAnswered || hintLoading}
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    {hintLoading ? 'Loading Hint...' : hintLevel === 0 ? '💡 Hint 1 (Gentle)' : hintLevel === 1 ? '💡 Hint 2 (Specific)' : hintLevel === 2 ? '💡 Hint 3 (Direct)' : '💡 All Hints Used'}
                  </button>

                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                    title="Ask AI Companion about confusing clues"
                  >
                    💬 {showChat ? 'Hide Chat' : 'Ask AI'}
                  </button>
                </div>
              </div>

              {/* Progressive Hints Display */}
              {unlockedHints.length > 0 && (
                <div className="hint-container">
                  {unlockedHints.map(h => (
                    <div key={h.level} className="hint-box">
                      <div className="hint-header">
                        Hint Level {h.level} {h.level === 1 ? '(Gentle Nudge)' : h.level === 2 ? '(Narrowing Down)' : '(Direct Clue)'}
                      </div>
                      <div>{h.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post-Solve Explanation Box */}
              {isAnswered && explanation && (
                <div className="explanation-box">
                  <div className="explanation-title">
                    💡 Why this fits:
                  </div>
                  <div className="explanation-text">{explanation}</div>
                </div>
              )}

              {/* Grounded Riddle AI Chat Assistant Drawer */}
              {showChat && (
                <div className="chat-drawer">
                  <div className="chat-drawer-header">
                    <span>🤖 Riddle Companion (Ask about clues)</span>
                    <button
                      type="button"
                      onClick={() => setShowChat(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="chat-messages">
                    <div className="chat-bubble chat-ai">
                      Greetings! Ask me about the riddle's metaphorical clues, difficult terms, or context. I won't spoil the solution!
                    </div>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                        {msg.text}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="chat-bubble chat-ai" style={{ opacity: 0.7 }}>
                        Thinking...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="chat-input-bar">
                    <input
                      type="text"
                      placeholder="Ask about a clue or word..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      maxLength={200}
                    />
                    <button type="submit" className="btn" style={{ padding: '8px 14px', fontSize: '13px' }} disabled={chatLoading || !chatInput.trim()}>
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Answer Input Field */}
            <div className="form-group">
              <input
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isAnswered && handleSubmitAnswer()}
                placeholder="Enter your answer..."
                disabled={isAnswered}
                autoFocus
              />
            </div>

            {!isAnswered ? (
              <button onClick={handleSubmitAnswer} className="btn">
                Submit Guess
              </button>
            ) : (
              <button onClick={handleNextRiddle} className="btn">
                {currentIndex + 1 >= riddles.length ? 'See Final Results' : 'Next Riddle'}
              </button>
            )}

            {feedback.text && (
              <div className={`feedback-msg ${feedback.type}`}>{feedback.text}</div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. COMPLETION SCREEN */}
        {/* ============================================================ */}
        {step === 'completion' && (
          <div>
            <div className="game-header">
              <h2>Game Complete! 🎉</h2>
              <p>Here is how you performed in this challenge.</p>
            </div>

            <div className="score-display" style={{ fontSize: '2.5rem', margin: '2rem 0' }}>
              Your Score
              <br />
              <span style={{ fontSize: '4rem', color: 'var(--accent)' }}>{score}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '16px 0', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <div>Riddles Solved: <strong>{riddlesSolved}/{riddles.length}</strong></div>
              <div>Max Streak: <strong>×{maxStreak}</strong></div>
              <div>Time Taken: <strong>{sessionSeconds}s</strong></div>
              <div>Mode: <strong>{gameMode === 'ai' ? '✨ AI-Generated' : '📚 Classic'}</strong></div>
            </div>

            {/* Unlocked Achievements Section */}
            {newAchievements.length > 0 && (
              <div className="unlocked-achievements">
                <h4>🏆 Achievement Unlocked!</h4>
                <div className="achievement-badge-list">
                  {newAchievements.map((ach, idx) => (
                    <div key={idx} className="achievement-chip">
                      <span>{ach.icon}</span>
                      <div>
                        <strong>{ach.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ach.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setStep('setup')} className="btn" style={{ marginTop: '24px' }}>
              Play Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
