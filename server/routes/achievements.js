// server/routes/achievements.js

const express = require('express');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/achievements — get all achievements with user unlock status
router.get('/', auth, async (req, res) => {
    try {
        const achievements = await Achievement.find().lean();
        const userAchievements = await UserAchievement.find({ userId: req.user._id }).lean();
        
        const unlockedMap = {};
        userAchievements.forEach(ua => {
            unlockedMap[ua.achievementId.toString()] = ua.unlockedAt;
        });

        const result = achievements.map(ach => ({
            id: ach._id,
            name: ach.name,
            description: ach.description,
            icon: ach.icon,
            requirement: ach.requirement,
            unlocked: !!unlockedMap[ach._id.toString()],
            unlockedAt: unlockedMap[ach._id.toString()] || null
        }));

        res.json({ achievements: result });
    } catch (error) {
        console.error('Achievements fetch error:', error);
        res.status(500).json({ message: 'Server error fetching achievements.' });
    }
});

module.exports = router;
