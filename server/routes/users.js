// server/routes/users.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const GameResult = require('../models/GameResult');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me/stats — dashboard statistics
router.get('/me/stats', auth, async (req, res) => {
    try {
        const user = req.user;
        const averageScore = user.totalGamesPlayed > 0
            ? Math.round(user.totalScore / user.totalGamesPlayed)
            : 0;

        res.json({
            name: user.name,
            gamesPlayed: user.totalGamesPlayed,
            bestScore: user.bestScore,
            averageScore,
            riddlesSolved: user.totalRiddlesSolved,
            currentStreak: user.currentStreak,
            memberSince: user.createdAt
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats.' });
    }
});

// GET /api/users/me/recent-games — last 10 game results
router.get('/me/recent-games', auth, async (req, res) => {
    try {
        const results = await GameResult.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.json({ results });
    } catch (error) {
        console.error('Get recent games error:', error);
        res.status(500).json({ message: 'Server error fetching recent games.' });
    }
});

// PUT /api/users/me/profile — update profile (name only for now)
router.put('/me/profile', auth, [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        req.user.name = req.body.name;
        await req.user.save();

        res.json({ user: req.user.toJSON() });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
});

module.exports = router;
