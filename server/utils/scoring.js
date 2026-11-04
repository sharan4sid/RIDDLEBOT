// server/utils/scoring.js
// Deterministic scoring logic — easy to modify later

const BASE_POINTS = {
    Easy: 10,
    Medium: 20,
    Hard: 30,
    Expert: 40
};

/**
 * Calculate points earned for a single riddle answer.
 *
 * @param {string}  difficulty   - 'Easy', 'Medium', 'Hard', or 'Expert'
 * @param {number}  streak       - current consecutive correct answers (0 = first correct)
 * @param {number}  timeTaken    - seconds taken to answer this riddle
 * @param {boolean} hintUsed     - whether the player used the hint
 * @returns {number} points earned (always >= 0)
 */
function calculatePoints(difficulty, streak, timeTaken, hintUsed) {
    const base = BASE_POINTS[difficulty] || 10;

    // Streak multiplier: each consecutive correct adds 0.5, capped at ×3 total
    const streakMultiplier = Math.min(1 + streak * 0.5, 3);

    // Time bonus
    let timeBonus = 0;
    if (timeTaken <= 10) timeBonus = 5;
    else if (timeTaken <= 20) timeBonus = 3;
    else if (timeTaken <= 30) timeBonus = 1;

    let points = Math.floor(base * streakMultiplier) + timeBonus;

    // Hint penalty: halve the total
    if (hintUsed) {
        points = Math.floor(points / 2);
    }

    return Math.max(points, 0);
}

module.exports = { calculatePoints, BASE_POINTS };
