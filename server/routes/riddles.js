// server/routes/riddles.js

const express = require('express');
const Riddle = require('../models/Riddle');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/riddles?category=X&difficulty=Y&limit=10
// Returns filtered riddles (answers excluded for gameplay)
router.get('/', auth, async (req, res) => {
    try {
        const { category, difficulty, limit = 10 } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;

        // Get matching riddles, randomised
        const riddles = await Riddle.aggregate([
            { $match: filter },
            { $sample: { size: parseInt(limit) } },
            { $project: {
                question: 1,
                category: 1,
                difficulty: 1,
                hint: 1,
                // answer is intentionally excluded for the client
                // it's validated server-side via the check-answer route
            }}
        ]);

        res.json({ riddles, total: riddles.length });
    } catch (error) {
        console.error('Get riddles error:', error);
        res.status(500).json({ message: 'Server error fetching riddles.' });
    }
});

// GET /api/riddles/categories — list available categories with counts
router.get('/categories', auth, async (req, res) => {
    try {
        const categories = await Riddle.aggregate([
            { $group: {
                _id: { category: '$category', difficulty: '$difficulty' },
                count: { $sum: 1 }
            }},
            { $group: {
                _id: '$_id.category',
                difficulties: {
                    $push: { difficulty: '$_id.difficulty', count: '$count' }
                },
                total: { $sum: '$count' }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error fetching categories.' });
    }
});

// POST /api/riddles/check-answer — validate an answer server-side
router.post('/check-answer', auth, async (req, res) => {
    try {
        const { riddleId, answer } = req.body;

        if (!riddleId || !answer) {
            return res.status(400).json({ message: 'riddleId and answer are required.' });
        }

        const riddle = await Riddle.findById(riddleId);
        if (!riddle) {
            return res.status(404).json({ message: 'Riddle not found.' });
        }

        // Normalise: lowercase, trim, collapse whitespace
        const normalised = answer.toLowerCase().trim().replace(/\s+/g, ' ');
        const isCorrect = normalised === riddle.answer;

        res.json({
            correct: isCorrect,
            // Only reveal the answer if the player got it wrong
            ...(isCorrect ? {} : { correctAnswer: riddle.answer })
        });
    } catch (error) {
        console.error('Check answer error:', error);
        res.status(500).json({ message: 'Server error checking answer.' });
    }
});

module.exports = router;
