// client/src/pages/Dashboard/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, gamesData, achData, recData] = await Promise.allSettled([
          api.getUserStats(),
          api.getRecentGames(),
          api.getAchievements(),
          api.getAIPersonalizedRecommendation()
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (gamesData.status === 'fulfilled') setRecentGames(gamesData.value.results || []);
        if (achData.status === 'fulfilled') setAchievements(achData.value.achievements || []);
        if (recData.status === 'fulfilled') setAiRecommendation(recData.value);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: '60px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div className="container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Track your riddle progress, AI challenges, and achievements.</p>
        </div>
        <Link to="/game" className="btn">
          <span>🎮 Play Game</span>
        </Link>
      </div>

      {/* Personalized AI Challenge Recommendation */}
      {aiRecommendation && (
        <div className="dashboard-section" style={{ background: 'linear-gradient(135deg, rgba(155, 92, 255, 0.12) 0%, rgba(33, 30, 48, 0.6) 100%)', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ marginBottom: '6px', color: 'var(--accent)' }}>✨ Personalized AI Challenge</h2>
              <p style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                Recommended for you: <strong>{aiRecommendation.recommendedCategory}</strong> ({aiRecommendation.recommendedDifficulty}) • {aiRecommendation.reason}
              </p>
            </div>
            <Link to="/game" className="btn">
              Accept Challenge ➔
            </Link>
          </div>
        </div>
      )}

      {/* 5-Card Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-value">{stats?.gamesPlayed || 0}</div>
          <div className="stat-label">Games Played</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats?.bestScore || 0}</div>
          <div className="stat-label">Best Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats?.averageScore || 0}</div>
          <div className="stat-label">Average Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧩</div>
          <div className="stat-value">{stats?.riddlesSolved || 0}</div>
          <div className="stat-label">Riddles Solved</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats?.currentStreak || 0}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>

      {/* Recent Games Section */}
      <div className="dashboard-section">
        <h2>📜 Recent Games</h2>
        {recentGames.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No games played yet. Click "Play Game" above to start your first challenge!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Solved</th>
                <th>Score</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game, idx) => (
                <tr key={idx}>
                  <td>{new Date(game.createdAt).toLocaleDateString()}</td>
                  <td>{game.category}</td>
                  <td>
                    <span className={`badge badge-${game.difficulty.toLowerCase()}`}>
                      {game.difficulty}
                    </span>
                  </td>
                  <td>{game.riddlesSolved}/{game.totalRiddles}</td>
                  <td><strong>{game.score} pts</strong></td>
                  <td>
                    <span className={`badge ${game.gameMode === 'ai' ? 'badge-expert' : 'badge-easy'}`}>
                      {game.gameMode === 'ai' ? '✨ AI' : '📚 Classic'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Achievements Section */}
      <div className="dashboard-section">
        <h2>🎖️ Achievements</h2>
        <div className="achievements-grid">
          {achievements.map((ach) => (
            <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : ''}`}>
              <div className="achievement-icon">{ach.icon}</div>
              <div>
                <div className="achievement-title">
                  {ach.name} {ach.unlocked ? '✓' : ''}
                </div>
                <div className="achievement-desc">{ach.description}</div>
                {ach.unlockedAt && (
                  <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>
                    Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
