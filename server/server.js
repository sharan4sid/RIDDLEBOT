// server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow client connections
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/riddles', require('./routes/riddles'));
app.use('/api/games', require('./routes/games'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Prahelikā API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Prahelikā server running on port ${PORT}`);
});
