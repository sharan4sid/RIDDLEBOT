// server/routes/admin.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const Riddle = require('../models/Riddle');
const User = require('../models/User');
const GameResult = require('../models/GameResult');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Require both auth and admin middleware for all routes in this file
router.use(auth, admin);

// ----------------------------------------------------
// 1. PLATFORM STATISTICS
// ----------------------------------------------------
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRiddles = await Riddle.countDocuments();
        const totalGames = await GameResult.countDocuments();

        // Popular categories
        const popularCategories = await GameResult.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalUsers,
            totalRiddles,
            totalGames,
            popularCategories: popularCategories.map(c => ({ category: c._id, count: c.count }))
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error fetching admin statistics.' });
    }
});

// ----------------------------------------------------
// 2. RIDDLE MANAGEMENT
// ----------------------------------------------------
router.get('/riddles', async (req, res) => {
    try {
        const { category, difficulty, search } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            filter.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } }
            ];
        }

        const riddles = await Riddle.find(filter).sort({ createdAt: -1 });
        res.json({ riddles });
    } catch (error) {
        console.error('Admin riddles fetch error:', error);
        res.status(500).json({ message: 'Server error fetching riddles.' });
    }
});

router.post('/riddles', [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('difficulty').notEmpty().withMessage('Difficulty is required'),
    body('hint').trim().notEmpty().withMessage('Hint is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const riddle = await Riddle.create(req.body);
        res.status(201).json({ riddle });
    } catch (error) {
        console.error('Admin create riddle error:', error);
        res.status(500).json({ message: 'Server error creating riddle.' });
    }
});

router.put('/riddles/:id', [
    body('question').optional().trim().notEmpty(),
    body('answer').optional().trim().notEmpty(),
    body('category').optional().notEmpty(),
    body('difficulty').optional().notEmpty(),
    body('hint').optional().trim().notEmpty()
], async (req, res) => {
    try {
        const riddle = await Riddle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!riddle) return res.status(404).json({ message: 'Riddle not found.' });
        res.json({ riddle });
    } catch (error) {
        console.error('Admin update riddle error:', error);
        res.status(500).json({ message: 'Server error updating riddle.' });
    }
});

router.delete('/riddles/:id', async (req, res) => {
    try {
        const riddle = await Riddle.findByIdAndDelete(req.params.id);
        if (!riddle) return res.status(404).json({ message: 'Riddle not found.' });
        res.json({ message: 'Riddle deleted successfully.' });
    } catch (error) {
        console.error('Admin delete riddle error:', error);
        res.status(500).json({ message: 'Server error deleting riddle.' });
    }
});

// ----------------------------------------------------
// 3. USER MANAGEMENT
// ----------------------------------------------------
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

router.patch('/users/:id', async (req, res) => {
    try {
        const { isActive, role } = req.body;
        const updates = {};
        if (typeof isActive === 'boolean') updates.isActive = isActive;
        if (role && ['user', 'admin'].includes(role)) updates.role = role;

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.json({ user });
    } catch (error) {
        console.error('Admin user update error:', error);
        res.status(500).json({ message: 'Server error updating user.' });
    }
});

module.exports = router;
