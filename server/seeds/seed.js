// server/seeds/seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Riddle = require('../models/Riddle');
const Achievement = require('../models/Achievement');

const riddlesData = [
    // General Knowledge / General
    {
        question: "What has to be broken before you can use it?",
        answer: "egg",
        category: "General Knowledge",
        difficulty: "Easy",
        hint: "It has a shell and a yolk."
    },
    {
        question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
        answer: "map",
        category: "General Knowledge",
        difficulty: "Medium",
        hint: "You use it to navigate and find places."
    },
    {
        question: "What disappears as soon as you say its name?",
        answer: "silence",
        category: "General Knowledge",
        difficulty: "Hard",
        hint: "It's the absence of sound."
    },
    
    // Science
    {
        question: "What can fill a room but takes up no space?",
        answer: "light",
        category: "Science",
        difficulty: "Easy",
        hint: "It comes from the sun or a bulb."
    },
    {
        question: "I am a gas that helps plants make their food, but I am what you breathe out. What am I?",
        answer: "carbon dioxide",
        category: "Science",
        difficulty: "Medium",
        hint: "Its chemical formula is CO2."
    },
    {
        question: "I can be liquid, solid, or gas. I am essential for life, yet I can be dangerous. What am I?",
        answer: "water",
        category: "Science",
        difficulty: "Hard",
        hint: "Its chemical formula is H2O."
    },

    // Nature
    {
        question: "What has a bank but no money?",
        answer: "river",
        category: "Nature",
        difficulty: "Easy",
        hint: "Water flows through it."
    },
    {
        question: "I touch the earth, I touch the sky, but if I touch you, you'll likely die. What am I?",
        answer: "lightning",
        category: "Nature",
        difficulty: "Medium",
        hint: "I happen during a thunderstorm."
    },
    {
        question: "I have roots that nobody sees, I am taller than trees. Up, up I go, but I never grow. What am I?",
        answer: "mountain",
        category: "Nature",
        difficulty: "Hard",
        hint: "Everest is one of them."
    },

    // History
    {
        question: "Who was the first President of the United States?",
        answer: "george washington",
        category: "History",
        difficulty: "Easy",
        hint: "His face is on the one-dollar bill."
    },
    {
        question: "I was built to protect an empire, stretching for thousands of miles. What am I?",
        answer: "great wall of china",
        category: "History",
        difficulty: "Medium",
        hint: "It is located in Asia."
    },
    {
        question: "I am a famous ship that sank on its maiden voyage in 1912. What am I?",
        answer: "titanic",
        category: "History",
        difficulty: "Hard",
        hint: "It hit an iceberg."
    },

    // Animals
    {
        question: "I have a long neck and I eat leaves from tall trees. What am I?",
        answer: "giraffe",
        category: "Animals",
        difficulty: "Easy",
        hint: "It has spots and lives in Africa."
    },
    {
        question: "I am known as the king of the jungle. What am I?",
        answer: "lion",
        category: "Animals",
        difficulty: "Easy",
        hint: "I have a mane and roar."
    },
    {
        question: "I have stripes, but I'm not a tiger. I look like a horse. What am I?",
        answer: "zebra",
        category: "Animals",
        difficulty: "Medium",
        hint: "Black and white stripes."
    },

    // Technology / Programming / Cybersecurity
    {
        question: "I have a screen, but I am not a TV. I have keys, but no locks. What am I?",
        answer: "computer",
        category: "Technology",
        difficulty: "Easy",
        hint: "You use it to browse the internet."
    },
    {
        question: "I can connect you to the world without wires. What am I?",
        answer: "wifi",
        category: "Technology",
        difficulty: "Medium",
        hint: "You need a router to use me."
    },
    {
        question: "I hold your data in the sky, though I am not a bird or a cloud. What am I?",
        answer: "cloud storage",
        category: "Technology",
        difficulty: "Hard",
        hint: "It's a metaphor for remote servers."
    },
    {
        question: "I am a set of step-by-step instructions given to a computer to solve a problem. What am I?",
        answer: "algorithm",
        category: "Programming",
        difficulty: "Easy",
        hint: "Starts with 'A' and is fundamental to computer science."
    },
    {
        question: "I am a secret word or phrase used to gain access to a secure computer system. What am I?",
        answer: "password",
        category: "Cybersecurity",
        difficulty: "Easy",
        hint: "You should never share me with anyone."
    },

    // Logic / Mathematics / Wordplay
    {
        question: "If you have me, you want to share me. If you share me, you don't have me. What am I?",
        answer: "secret",
        category: "Logic",
        difficulty: "Easy",
        hint: "You shouldn't tell anyone."
    },
    {
        question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
        answer: "m",
        category: "Wordplay",
        difficulty: "Medium",
        hint: "Think about the letter itself."
    },
    {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        category: "Logic",
        difficulty: "Hard",
        hint: "I repeat what you say."
    },
    {
        question: "I am an odd number. Take away a letter and I become even. What number am I?",
        answer: "seven",
        category: "Mathematics",
        difficulty: "Expert",
        hint: "Remove 's'."
    }
];

const achievementsData = [
    {
        name: "First Step",
        description: "Solve your first riddle.",
        icon: "🌱",
        requirement: { type: "riddles_solved", value: 1 }
    },
    {
        name: "Riddle Enthusiast",
        description: "Solve 10 riddles.",
        icon: "🧠",
        requirement: { type: "riddles_solved", value: 10 }
    },
    {
        name: "Riddle Master",
        description: "Solve 50 riddles.",
        icon: "🎓",
        requirement: { type: "riddles_solved", value: 50 }
    },
    {
        name: "Grand Master",
        description: "Solve 100 riddles.",
        icon: "👑",
        requirement: { type: "riddles_solved", value: 100 }
    },
    {
        name: "Flawless Victory",
        description: "Achieve a perfect score in a 5-riddle session.",
        icon: "⭐",
        requirement: { type: "perfect_game", value: 5 }
    },
    {
        name: "Dedicated Solver",
        description: "Maintain a 7-day play streak.",
        icon: "🔥",
        requirement: { type: "streak", value: 7 }
    },
    {
        name: "Legendary Streak",
        description: "Maintain a 30-day play streak.",
        icon: "⚡",
        requirement: { type: "streak", value: 30 }
    },
    {
        name: "Expert Connoisseur",
        description: "Solve an Expert difficulty riddle.",
        icon: "🏆",
        requirement: { type: "expert_solve", value: 1 }
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing collections
        await Riddle.deleteMany({});
        await Achievement.deleteMany({});

        // Insert Riddles & Achievements
        await Riddle.insertMany(riddlesData);
        console.log(`Successfully seeded ${riddlesData.length} riddles.`);

        await Achievement.insertMany(achievementsData);
        console.log(`Successfully seeded ${achievementsData.length} achievements.`);

        // Create default admin user if none exists
        const adminEmail = 'admin@prahelika.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash('admin123', salt);
            await User.create({
                name: 'Prahelikā Admin',
                email: adminEmail,
                passwordHash,
                role: 'admin'
            });
            console.log('Created default admin account: admin@prahelika.com / admin123');
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
