// server/models/GameResult.js

const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    riddlesSolved: {
        type: Number,
        required: true,
        min: 0
    },
    totalRiddles: {
        type: Number,
        required: true,
        min: 1
    },
    timeTaken: {
        type: Number,  // total seconds for the session
        required: true,
        min: 0
    },
    maxStreak: {
        type: Number,
        default: 0
    },
    hintsUsed: {
        type: Number,
        default: 0
    },
    gameMode: {
        type: String,
        enum: ['classic', 'ai'],
        default: 'classic'
    },
    topic: {
        type: String,
        default: ''
    }
}, {
    timestamps: true  // createdAt = when game was completed
});

// Index for leaderboard queries
gameResultSchema.index({ score: -1, createdAt: -1 });
gameResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GameResult', gameResultSchema);
