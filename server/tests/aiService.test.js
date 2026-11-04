// server/tests/aiService.test.js
// Automated test suite for Prahelikā Version 3 AI Service & Logic

const assert = require('assert');
const aiService = require('../services/aiService');
const { calculatePoints } = require('../utils/scoring');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    Error: ${err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    Error: ${err.message}`);
    }
}

async function runAllTests() {
    console.log('\n==================================================');
    console.log('RUNNING PRAHELIKĀ VERSION 3 AI SERVICE TESTS');
    console.log('==================================================\n');

    // 1. Answer Normalization & Cleaning
    runTest('normalizeAnswer strips punctuation, whitespace, and leading articles', () => {
        assert.strictEqual(aiService.normalizeAnswer('  A Clock!  '), 'clock');
        assert.strictEqual(aiService.normalizeAnswer('The Great Wall of China?'), 'great wall of china');
        assert.strictEqual(aiService.normalizeAnswer('AN EGG.'), 'egg');
        assert.strictEqual(aiService.normalizeAnswer(''), '');
    });

    // 2. Riddle Structure Validation
    runTest('validateRiddleStructure passes valid riddle', () => {
        const validRiddle = {
            question: 'I have cities, but no houses. What am I?',
            answer: 'map',
            hints: ['Look at paper.', 'Used for navigation.', 'Shows continents.'],
            explanation: 'A map shows symbols of cities and terrain without physical buildings.'
        };
        assert.strictEqual(aiService.validateRiddleStructure(validRiddle, 'General Knowledge', 'Easy'), true);
    });

    runTest('validateRiddleStructure rejects missing answer or short question', () => {
        assert.strictEqual(aiService.validateRiddleStructure({ question: 'Too short' }, 'Logic', 'Easy'), false);
        assert.strictEqual(aiService.validateRiddleStructure({ question: 'A valid question that is long enough?', answer: '' }, 'Logic', 'Easy'), false);
    });

    runTest('validateRiddleStructure rejects when question contains answer', () => {
        const invalidRiddle = {
            question: 'What kind of bicycle is a bicycle that rides in a park?',
            answer: 'bicycle',
            hints: ['It has two wheels.'],
            explanation: 'It is a bicycle.'
        };
        assert.strictEqual(aiService.validateRiddleStructure(invalidRiddle, 'Logic', 'Easy'), false);
    });

    // 3. Deterministic & Accepted Alternative Answer Evaluation
    await runAsyncTest('evaluateAnswer recognizes exact matches deterministically without API', async () => {
        const mockRiddle = {
            question: 'What has to be broken before you can use it?',
            answer: 'egg',
            acceptedAnswers: ['raw egg', 'chicken egg']
        };

        const res1 = await aiService.evaluateAnswer({ riddle: mockRiddle, userAnswer: 'An Egg!' });
        assert.strictEqual(res1.isCorrect, true);
        assert.strictEqual(res1.isSemantic, false);

        const res2 = await aiService.evaluateAnswer({ riddle: mockRiddle, userAnswer: 'chicken egg' });
        assert.strictEqual(res2.isCorrect, true);
    });

    await runAsyncTest('evaluateAnswer rejects clearly incorrect answers', async () => {
        const mockRiddle = {
            question: 'What has keys but no locks?',
            answer: 'piano',
            acceptedAnswers: ['keyboard']
        };

        const res = await aiService.evaluateAnswer({ riddle: mockRiddle, userAnswer: 'a submarine sandwich' });
        assert.strictEqual(res.isCorrect, false);
    });

    // 4. Progressive Hints Progression
    await runAsyncTest('getProgressiveHint returns cached hints by level', async () => {
        const mockRiddle = {
            question: 'What has hands but cannot clap?',
            answer: 'clock',
            hint: 'Look at the wall.',
            hints: [
                'Level 1: It measures a fundamental dimension of reality.',
                'Level 2: It has numbers from 1 to 12.',
                'Level 3: It has an hour hand and a minute hand.'
            ]
        };

        const hint1 = await aiService.getProgressiveHint(mockRiddle, 1);
        assert.strictEqual(hint1.level, 1);
        assert.strictEqual(hint1.hint, mockRiddle.hints[0]);

        const hint2 = await aiService.getProgressiveHint(mockRiddle, 2);
        assert.strictEqual(hint2.level, 2);
        assert.strictEqual(hint2.hint, mockRiddle.hints[1]);

        const hint3 = await aiService.getProgressiveHint(mockRiddle, 3);
        assert.strictEqual(hint3.level, 3);
        assert.strictEqual(hint3.hint, mockRiddle.hints[2]);
    });

    // 5. Answer Explanation Logic
    await runAsyncTest('getExplanation returns pre-existing explanation if available', async () => {
        const mockRiddle = {
            question: 'What goes up but never comes down?',
            answer: 'age',
            explanation: 'Your age increases every year and can never decrease.'
        };

        const res = await aiService.getExplanation(mockRiddle);
        assert.strictEqual(res.explanation, mockRiddle.explanation);
        assert.strictEqual(res.isAiGenerated, false);
    });

    // 6. Grounded Riddle Chat Safety Guardrails
    await runAsyncTest('chatAboutRiddle handles empty message safely', async () => {
        const mockRiddle = {
            question: 'What gets wet while drying?',
            answer: 'towel'
        };

        const res = await aiService.chatAboutRiddle({ riddle: mockRiddle, message: '   ' });
        assert.ok(res.reply.length > 0);
    });

    // 7. Personalized Recommendations
    await runAsyncTest('getRecommendation calculates appropriate category & difficulty from history', async () => {
        const mockUser = { currentStreak: 6 };
        const mockGames = [
            { category: 'Programming', difficulty: 'Medium', riddlesSolved: 5, totalRiddles: 5, score: 180 },
            { category: 'Programming', difficulty: 'Medium', riddlesSolved: 5, totalRiddles: 5, score: 200 }
        ];

        const rec = await aiService.getRecommendation({ user: mockUser, recentGames: mockGames });
        assert.strictEqual(rec.recommendedCategory, 'Programming');
        assert.strictEqual(rec.recommendedDifficulty, 'Expert'); // high win rate + streak >= 5
    });

    // 8. Scoring Consistency Verification
    runTest('calculatePoints follows deterministic formula across difficulties', () => {
        // Base points: Easy=10, Medium=20, Hard=30, Expert=40
        // Easy, streak=0, time=5s, hint=false => 10 + 5 (time bonus) = 15
        assert.strictEqual(calculatePoints('Easy', 0, 5, false), 15);

        // Medium, streak=2 (multiplier=2.0), time=15s (+3), hint=false => 20*2.0 + 3 = 43
        assert.strictEqual(calculatePoints('Medium', 2, 15, false), 43);

        // Hard, streak=1 (multiplier=1.5), time=8s (+5), hint=true => floor((30*1.5 + 5)/2) = floor(50/2) = 25
        assert.strictEqual(calculatePoints('Hard', 1, 8, true), 25);

        // Expert, streak=4 (capped at 3.0), time=25s (+1), hint=false => 40*3.0 + 1 = 121
        assert.strictEqual(calculatePoints('Expert', 4, 25, false), 121);
    });

    console.log('\n--------------------------------------------------');
    console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
    console.log('--------------------------------------------------\n');

    if (passedTests === totalTests) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runAllTests();
