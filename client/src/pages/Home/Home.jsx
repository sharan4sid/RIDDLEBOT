// client/src/pages/Home/Home.jsx

import React from 'react';
import './Home.css';

export function Home() {
  return (
    <div class="container">
      <div class="hero">
        <h1 class="hero-title">
          <span class="hero-icon" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
            </svg>
          </span>
          Welcome to prahelikā!
        </h1>
        <p class="hero-subtitle">Your journey into the world of riddles begins here.</p>
        <p class="hero-description">Explore the fascinating world of riddles! Learn about different types, sharpen your solving skills, and discover their rich history, especially within Indian culture. Get ready to challenge your mind!</p>
      </div>

      <div class="info-grid">
        <article class="info-card">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 0-.253 1.02l.363 1.246c.253.87-.143 1.905-.895 2.657-.962.96-2.278 1.16-3.23.407l-1.05-.826a.976.976 0 0 0-1.376.154l-.763.953c-.672.84-1.69 1.157-2.604.83l-1.376-.492a.978.978 0 0 0-1.07.252l-1.442 1.442c-.566.566-1.282.849-1.998.849s-1.432-.283-1.998-.849c-1.1-1.1-1.1-2.896 0-3.996l1.442-1.442a.978.978 0 0 0 .252-1.07l-.492-1.376c-.327-.914-.01-1.932.83-2.604l.953-.763a.976.976 0 0 0 .154-1.376l-.826-1.05c-.754-.952-.553-2.268.407-3.23.751-.752 1.786-1.148 2.657-.895l1.246.363a.98.98 0 0 0 1.02-.253l1.611-1.611c.47-.47 1.087-.706 1.704-.706s1.233.235 1.704.706l1.568 1.568c.23.23.556.338.878.289.923-.14 1.838.214 2.506.883.74.74 1.045 1.802.798 2.755Z"/>
              </svg>
            </span>
            <h2 class="card-title">Types of Riddles</h2>
          </div>
          <p class="card-description">Riddles challenge us in various ways:</p>
          <ul class="card-list">
            <li><strong>Enigmas:</strong> Metaphorical or allegorical (e.g., "What has an eye, but cannot see?" - A needle).</li>
            <li><strong>Conundrums:</strong> Rely on puns/wordplay (e.g., "What kind of band never plays music?" - A rubber band).</li>
            <li><strong>Logic Puzzles:</strong> Require deductive reasoning (e.g., River crossing puzzles).</li>
          </ul>
        </article>

        <article class="info-card">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
              </svg>
            </span>
            <h2 class="card-title">Think Like a Solver</h2>
          </div>
          <p class="card-description">Develop your riddle-solving skills:</p>
          <ul class="card-list">
            <li><strong>Read Carefully:</strong> Every word counts.</li>
            <li><strong>Look for Double Meanings:</strong> Wordplay is common.</li>
            <li><strong>Think Metaphorically:</strong> Don't always be literal.</li>
            <li><strong>Eliminate Possibilities:</strong> Rule out what doesn't fit.</li>
          </ul>
        </article>

        <article class="info-card">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M12 7v5l4 2"/>
              </svg>
            </span>
            <h2 class="card-title">Riddles in Indian History</h2>
          </div>
          <p class="card-description">Riddles (Prahelikā) have a rich tradition in India:</p>
          <ul class="card-list">
            <li><strong>Ancient Texts:</strong> Found in Vedas, Upanishads, and Puranas, often conveying philosophical ideas.</li>
            <li><strong>Epics:</strong> The Mahabharata features the famous "Yaksha Prashna," where Yudhishthira answers riddles.</li>
            <li><strong>Folklore:</strong> Integral to tales like Vikram and Betal for wit and wisdom tests.</li>
          </ul>
        </article>
      </div>
    </div>
  );
}
