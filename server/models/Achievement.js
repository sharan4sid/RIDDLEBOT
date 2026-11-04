// server/models/Achievement.js

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,    // emoji or icon identifier
        default: '🏆'
    },
    requirement: {
        type: {
            type: String,  // 'riddles_solved', 'games_played', 'perfect_game', 'streak', 'score', 'expert_solve'
            required: true
        },
        value: {
            type: Number,  // threshold to unlock
            required: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
