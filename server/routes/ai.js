// server/routes/ai.js
// REST endpoints for Prahelikā Version 3 AI features

const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const auth = require('../middleware/auth');
const Riddle = require('../models/Riddle');
const GameResult = require('../models/GameResult');

const router = express.Router();

// Apply rate limiter to all AI endpoints
router.use(aiRateLimiter);

// -------------------------------------------------------------
// Helper: Resolve Riddle from ID or Request Body
// -------------------------------------------------------------
async function resolveRiddle(req) {
    const { id } = req.params;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
        const found = await Riddle.findById(id);
        if (found) return found;
    }

    // In-memory riddle passed in body (e.g. temporary unpersisted session)
    if (req.body.riddle && req.body.riddle.question && req.body.riddle.answer) {
        return req.body.riddle;
    }

    return null;
}

// -------------------------------------------------------------
// 1. GENERATE AI RIDDLES
// POST /api/ai/riddles/generate
// -------------------------------------------------------------
router.post('/riddles/generate', auth, [
    body('category').optional().isString().trim(),
    body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard', 'Expert']),
    body('count').optional().isInt({ min: 1, max: 10 }),
    body('topic').optional().isString().trim().isLength({ max: 80 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const {
            category = 'General Knowledge',
            difficulty = 'Medium',
            count = 5,
            topic = '',
            persist = true // Save generated riddles to DB
        } = req.body;

        const generated = await aiService.generateRiddles({
            category,
            difficulty,
            count: parseInt(count, 10),
            topic
        });

        if (!generated || generated.length === 0) {
            return res.status(500).json({ message: 'Unable to generate riddles. Please try again or switch to classic mode.' });
        }

        // Persist validated AI riddles into MongoDB so they have true ObjectIds
        const persistedRiddles = [];
        if (persist) {
            for (const item of generated) {
                try {
                    // Check if identical question already exists to prevent duplicate spam
                    let r = await Riddle.findOne({ question: item.question });
                    if (!r) {
                        r = await Riddle.create(item);
                    }
                    persistedRiddles.push(r);
                } catch (persistErr) {
                    console.error('Failed to persist generated riddle:', persistErr.message);
                    persistedRiddles.push(item);
                }
            }
        } else {
            persistedRiddles.push(...generated);
        }

        // Project client-safe response (do NOT leak answers to frontend)
        const safeRiddles = persistedRiddles.map(r => ({
            _id: r._id || r.id,
            question: r.question,
            category: r.category,
            difficulty: r.difficulty,
            hint: r.hint,
            hints: r.hints || [r.hint],
            topic: r.topic || '',
            source: r.source || 'ai'
        }));

        res.json({
            riddles: safeRiddles,
            total: safeRiddles.length,
            isAiGenerated: true,
            topic
        });
    } catch (err) {
        console.error('AI generation route error:', err);
        res.status(500).json({ message: 'Server error generating AI riddles.' });
    }
});

// -------------------------------------------------------------
// 2. PROGRESSIVE HINTS
// POST /api/ai/riddles/:id/hints
// -------------------------------------------------------------
router.post('/riddles/:id/hints', auth, async (req, res) => {
    try {
        const riddle = await resolveRiddle(req);
        if (!riddle) {
            return res.status(404).json({ message: 'Riddle not found.' });
        }

        const level = parseInt(req.body.level, 10) || 1;
        const hintResult = await aiService.getProgressiveHint(riddle, level);

        res.json({
            level: hintResult.level,
            hint: hintResult.hint,
            isAiGenerated: hintResult.isAiGenerated
        });
    } catch (err) {
        console.error('AI hint route error:', err);
        res.status(500).json({ message: 'Failed to retrieve hint.' });
    }
});

// -------------------------------------------------------------
// 3. INTELLIGENT ANSWER EVALUATION
// POST /api/ai/riddles/:id/evaluate
// -------------------------------------------------------------
router.post('/riddles/:id/evaluate', auth, [
    body('answer').isString().trim().notEmpty().withMessage('Answer is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const riddle = await resolveRiddle(req);
        if (!riddle) {
            return res.status(404).json({ message: 'Riddle not found.' });
        }

        const { answer, isFinalAttempt = false } = req.body;

        const evalResult = await aiService.evaluateAnswer({
            riddle,
            userAnswer: answer
        });

        // Only reveal the canonical answer if player is correct OR out of attempts
        const responsePayload = {
            isCorrect: evalResult.isCorrect,
            feedback: evalResult.feedback,
            isSemantic: evalResult.isSemantic
        };

        if (evalResult.isCorrect || isFinalAttempt) {
            responsePayload.correctAnswer = riddle.answer;
            responsePayload.explanation = riddle.explanation || null;
        }

        res.json(responsePayload);
    } catch (err) {
        console.error('Answer evaluation route error:', err);
        res.status(500).json({ message: 'Failed to evaluate answer.' });
    }
});

// -------------------------------------------------------------
// 4. ANSWER EXPLANATION
// POST /api/ai/riddles/:id/explanation
// -------------------------------------------------------------
router.post('/riddles/:id/explanation', auth, async (req, res) => {
    try {
        const riddle = await resolveRiddle(req);
        if (!riddle) {
            return res.status(404).json({ message: 'Riddle not found.' });
        }

        const result = await aiService.getExplanation(riddle);

        res.json({
            explanation: result.explanation,
            isAiGenerated: result.isAiGenerated
        });
    } catch (err) {
        console.error('Explanation route error:', err);
        res.status(500).json({ message: 'Failed to retrieve explanation.' });
    }
});

// -------------------------------------------------------------
// 5. GROUNDED RIDDLE CHAT
// POST /api/ai/riddles/:id/chat
// -------------------------------------------------------------
router.post('/riddles/:id/chat', auth, [
    body('message').isString().trim().notEmpty().isLength({ max: 250 }).withMessage('Message must be 1-250 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const riddle = await resolveRiddle(req);
        if (!riddle) {
            return res.status(404).json({ message: 'Riddle not found.' });
        }

        const { message, history = [], isAnswerRevealed = false } = req.body;

        const chatResult = await aiService.chatAboutRiddle({
            riddle,
            message,
            history,
            isAnswerRevealed: !!isAnswerRevealed
        });

        res.json(chatResult);
    } catch (err) {
        console.error('Chat route error:', err);
        res.status(500).json({ message: 'Failed to process chat message.' });
    }
});

// -------------------------------------------------------------
// 6. PERSONALIZED RECOMMENDATIONS
// GET /api/ai/personalize
// -------------------------------------------------------------
router.get('/personalize', auth, async (req, res) => {
    try {
        const recentGames = await GameResult.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const recommendation = await aiService.getRecommendation({
            user: req.user,
            recentGames
        });

        res.json(recommendation);
    } catch (err) {
        console.error('Personalize route error:', err);
        res.status(500).json({ message: 'Failed to generate recommendations.' });
    }
});

module.exports = router;
