// server/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Stats (updated after each game)
    totalGamesPlayed: { type: Number, default: 0 },
    totalRiddlesSolved: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastPlayedAt: { type: Date, default: null }
}, {
    timestamps: true  // adds createdAt and updatedAt
});

// Never return passwordHash in JSON responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.passwordHash;
    return user;
};

module.exports = mongoose.model('User', userSchema);
