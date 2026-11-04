// server/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

// POST /api/auth/register
router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({ name, email, passwordHash });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        // Find user (we need passwordHash so we can't rely on toJSON)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account has been disabled.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// GET /api/auth/me — get current user from token
router.get('/me', auth, async (req, res) => {
    res.json({ user: req.user.toJSON() });
});

// POST /api/auth/forgot-password — placeholder
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
    // Placeholder: in production, send a password reset email
    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
});

module.exports = router;
