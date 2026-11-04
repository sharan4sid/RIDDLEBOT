// client/src/pages/Leaderboard/Leaderboard.jsx

import React, { useEffect, useState } from 'react';
import { api } from '../../api/api';
import './Leaderboard.css';

export function Leaderboard() {
  const [period, setPeriod] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const data = await api.getLeaderboard(period);
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [period]);

  return (
    <div class="container">
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <div>
            <h1>🏆 Player Leaderboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Top riddle solvers ranked by performance.</p>
          </div>

          <div class="tab-group">
            <button 
              class={`tab-btn ${period === 'daily' ? 'active' : ''}`}
              onClick={() => setPeriod('daily')}
            >
              Daily
            </button>
            <button 
              class={`tab-btn ${period === 'weekly' ? 'active' : ''}`}
              onClick={() => setPeriod('weekly')}
            >
              Weekly
            </button>
            <button 
              class={`tab-btn ${period === 'monthly' ? 'active' : ''}`}
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </button>
            <button 
              class={`tab-btn ${period === 'all' ? 'active' : ''}`}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading leaderboard rankings...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No scores recorded for this time period yet. Be the first to play!
          </div>
        ) : (
          <table class="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Player</th>
                <th>Total Score</th>
                <th>Best Score</th>
                <th>Games Played</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td>
                    <span class={`rank-pill rank-${entry.rank}`}>
                      {entry.rank <= 3 ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') : entry.rank}
                    </span>
                  </td>
                  <td>
                    <strong>{entry.name}</strong>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent)' }}>{entry.totalScore} pts</strong>
                  </td>
                  <td>{entry.bestScore} pts</td>
                  <td>{entry.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
