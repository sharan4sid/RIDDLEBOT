// server/routes/leaderboard.js

const express = require('express');
const GameResult = require('../models/GameResult');
const User = require('../models/User');

const router = express.Router();

// GET /api/leaderboard?period=daily|weekly|monthly|all
router.get('/', async (req, res) => {
    try {
        const { period = 'all' } = req.query;

        // Build date filter based on period
        let dateFilter = {};
        const now = new Date();
        switch (period) {
            case 'daily':
                dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
                break;
            case 'weekly':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                dateFilter = { createdAt: { $gte: weekAgo } };
                break;
            case 'monthly':
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                dateFilter = { createdAt: { $gte: monthAgo } };
                break;
            case 'all':
            default:
                // No date filter
                break;
        }

        // Aggregate: group by user, sum scores and games
        const leaderboard = await GameResult.aggregate([
            { $match: dateFilter },
            { $group: {
                _id: '$userId',
                totalScore: { $sum: '$score' },
                gamesPlayed: { $sum: 1 },
                bestScore: { $max: '$score' },
                avgScore: { $avg: '$score' }
            }},
            { $sort: { totalScore: -1 } },
            { $limit: 50 },
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }},
            { $unwind: '$user' },
            { $project: {
                _id: 0,
                userId: '$_id',
                name: '$user.name',
                totalScore: 1,
                gamesPlayed: 1,
                bestScore: 1,
                avgScore: { $round: ['$avgScore', 0] }
            }}
        ]);

        // Add rank
        const ranked = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        res.json({ leaderboard: ranked, period });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard.' });
    }
});

module.exports = router;
