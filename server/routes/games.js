// server/routes/games.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const GameResult = require('../models/GameResult');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/games/result — save a completed game result
router.post('/result', auth, [
    body('score').isInt({ min: 0 }).withMessage('Score must be a non-negative integer'),
    body('category').notEmpty().withMessage('Category is required'),
    body('difficulty').notEmpty().withMessage('Difficulty is required'),
    body('riddlesSolved').isInt({ min: 0 }).withMessage('Riddles solved must be non-negative'),
    body('totalRiddles').isInt({ min: 1 }).withMessage('Total riddles must be at least 1'),
    body('timeTaken').isInt({ min: 0 }).withMessage('Time taken must be non-negative'),
    body('maxStreak').optional().isInt({ min: 0 }),
    body('hintsUsed').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { score, category, difficulty, riddlesSolved, totalRiddles, timeTaken, maxStreak = 0, hintsUsed = 0 } = req.body;

        // Save game result
        const result = await GameResult.create({
            userId: req.user._id,
            score,
            category,
            difficulty,
            riddlesSolved,
            totalRiddles,
            timeTaken,
            maxStreak,
            hintsUsed
        });

        // Update user stats
        const user = req.user;
        user.totalGamesPlayed += 1;
        user.totalRiddlesSolved += riddlesSolved;
        user.totalScore += score;
        if (score > user.bestScore) user.bestScore = score;

        // Update streak: if played today or yesterday, increment; otherwise reset
        const now = new Date();
        if (user.lastPlayedAt) {
            const daysSince = Math.floor((now - user.lastPlayedAt) / (1000 * 60 * 60 * 24));
            if (daysSince <= 1) {
                user.currentStreak += 1;
            } else {
                user.currentStreak = 1;
            }
        } else {
            user.currentStreak = 1;
        }
        user.lastPlayedAt = now;
        await user.save();

        // Check and unlock achievements
        const newAchievements = await checkAchievements(user, riddlesSolved, totalRiddles, difficulty);

        res.status(201).json({
            result: result.toJSON(),
            stats: {
                totalGamesPlayed: user.totalGamesPlayed,
                bestScore: user.bestScore,
                currentStreak: user.currentStreak
            },
            newAchievements
        });
    } catch (error) {
        console.error('Save result error:', error);
        res.status(500).json({ message: 'Server error saving game result.' });
    }
});

/**
 * Checks all achievements and unlocks any newly earned ones.
 * Returns array of newly unlocked achievement names.
 */
async function checkAchievements(user, riddlesSolved, totalRiddles, difficulty) {
    const newlyUnlocked = [];

    try {
        const allAchievements = await Achievement.find();
        const userAchievements = await UserAchievement.find({ userId: user._id });
        const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId.toString()));

        for (const achievement of allAchievements) {
            // Skip already unlocked
            if (unlockedIds.has(achievement._id.toString())) continue;

            let earned = false;
            const reqType = achievement.requirement.type;
            const reqValue = achievement.requirement.value;

            switch (reqType) {
                case 'riddles_solved':
                    earned = user.totalRiddlesSolved >= reqValue;
                    break;
                case 'games_played':
                    earned = user.totalGamesPlayed >= reqValue;
                    break;
                case 'perfect_game':
                    earned = riddlesSolved === totalRiddles && totalRiddles >= reqValue;
                    break;
                case 'streak':
                    earned = user.currentStreak >= reqValue;
                    break;
                case 'score':
                    earned = user.bestScore >= reqValue;
                    break;
                case 'expert_solve':
                    earned = difficulty === 'Expert' && riddlesSolved >= reqValue;
                    break;
            }

            if (earned) {
                await UserAchievement.create({
                    userId: user._id,
                    achievementId: achievement._id
                });
                newlyUnlocked.push({
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon
                });
            }
        }
    } catch (error) {
        console.error('Achievement check error:', error);
    }

    return newlyUnlocked;
}

module.exports = router;
