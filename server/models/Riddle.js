// server/models/Riddle.js

const mongoose = require('mongoose');

const riddleSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
        trim: true,
        lowercase: true
    },
    // Accepted alternative answers for semantic / synonym evaluation
    acceptedAnswers: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'General Knowledge', 'Logic', 'Programming',
            'Cybersecurity', 'Science', 'History',
            'Mathematics', 'Wordplay', 'Nature',
            'Animals', 'Technology'
        ]
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty is required'],
        enum: ['Easy', 'Medium', 'Hard', 'Expert']
    },
    // Primary / default single hint for backward compatibility
    hint: {
        type: String,
        required: [true, 'Hint is required'],
        trim: true
    },
    // V3 Progressive hints array (Level 1 subtle, Level 2 narrowing, Level 3 direct)
    hints: {
        type: [String],
        default: []
    },
    // Explanation of why the answer is correct
    explanation: {
        type: String,
        default: ''
    },
    // Optional sub-topic or theme (e.g., "Space", "Algorithms")
    topic: {
        type: String,
        default: ''
    },
    // Track origin (pre-seeded/manual vs AI-generated)
    source: {
        type: String,
        enum: ['manual', 'ai'],
        default: 'manual'
    }
}, {
    timestamps: true  // adds createdAt and updatedAt
});

// Index for efficient querying by category + difficulty
riddleSchema.index({ category: 1, difficulty: 1 });
riddleSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model('Riddle', riddleSchema);
