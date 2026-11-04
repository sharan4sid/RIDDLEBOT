// client/src/pages/Admin/AdminDashboard.jsx

import React, { useEffect, useState } from 'react';
import { api } from '../../api/api';
import './Admin.css';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Riddles State
  const [riddles, setRiddles] = useState([]);
  const [riddleSearch, setRiddleSearch] = useState('');
  const [riddleCategoryFilter, setRiddleCategoryFilter] = useState('');
  const [riddlesLoading, setRiddlesLoading] = useState(false);
  const [showRiddleModal, setShowRiddleModal] = useState(false);
  const [editingRiddle, setEditingRiddle] = useState(null);
  const [riddleForm, setRiddleForm] = useState({
    question: '', answer: '', category: 'General Knowledge', difficulty: 'Easy', hint: ''
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'stats') loadStats();
    if (activeTab === 'riddles') loadRiddles();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  async function loadStats() {
    setStatsLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadRiddles() {
    setRiddlesLoading(true);
    try {
      const data = await api.getAdminRiddles({ search: riddleSearch, category: riddleCategoryFilter });
      setRiddles(data.riddles || []);
    } catch (err) {
      console.error('Failed to load admin riddles:', err);
    } finally {
      setRiddlesLoading(false);
    }
  }

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setUsersLoading(false);
    }
  }

  // Riddle Form Submit
  async function handleRiddleSubmit(e) {
    e.preventDefault();
    try {
      if (editingRiddle) {
        await api.updateRiddle(editingRiddle._id, riddleForm);
      } else {
        await api.createRiddle(riddleForm);
      }
      setShowRiddleModal(false);
      setEditingRiddle(null);
      setRiddleForm({ question: '', answer: '', category: 'General Knowledge', difficulty: 'Easy', hint: '' });
      loadRiddles();
    } catch (err) {
      alert(err.message || 'Failed to save riddle.');
    }
  }

  async function handleDeleteRiddle(id) {
    if (window.confirm('Are you sure you want to delete this riddle?')) {
      try {
        await api.deleteRiddle(id);
        loadRiddles();
      } catch (err) {
        alert(err.message || 'Failed to delete riddle.');
      }
    }
  }

  function openEditRiddle(riddle) {
    setEditingRiddle(riddle);
    setRiddleForm({
      question: riddle.question,
      answer: riddle.answer,
      category: riddle.category,
      difficulty: riddle.difficulty,
      hint: riddle.hint
    });
    setShowRiddleModal(true);
  }

  async function handleToggleUserActive(userId, currentStatus) {
    try {
      await api.updateUserRoleOrStatus(userId, { isActive: !currentStatus });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  }

  async function handleToggleUserRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.updateUserRoleOrStatus(userId, { role: newRole });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    }
  }

  return (
    <div class="container">
      <div class="admin-header">
        <div>
          <h1>🛡️ Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage riddles, users, and platform analytics.</p>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div class="admin-nav">
        <button 
          class={`admin-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
        <button 
          class={`admin-nav-btn ${activeTab === 'riddles' ? 'active' : ''}`}
          onClick={() => setActiveTab('riddles')}
        >
          🧩 Riddle Management
        </button>
        <button 
          class={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
      </div>

      {/* 1. STATISTICS TAB */}
      {activeTab === 'stats' && (
        <div>
          {statsLoading ? (
            <div>Loading statistics...</div>
          ) : (
            <>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">👥</div>
                  <div class="stat-value">{stats?.totalUsers || 0}</div>
                  <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🧩</div>
                  <div class="stat-value">{stats?.totalRiddles || 0}</div>
                  <div class="stat-label">Total Riddles</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🎮</div>
                  <div class="stat-value">{stats?.totalGames || 0}</div>
                  <div class="stat-label">Games Played</div>
                </div>
              </div>

              <div class="dashboard-section" style={{ marginTop: '24px' }}>
                <h2>🔥 Popular Categories</h2>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Games Played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.popularCategories?.map((cat, idx) => (
                      <tr key={idx}>
                        <td><strong>{cat.category}</strong></td>
                        <td>{cat.count} games</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. RIDDLE MANAGEMENT TAB */}
      {activeTab === 'riddles' && (
        <div class="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search riddles or answers..."
                value={riddleSearch}
                onChange={e => setRiddleSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadRiddles()}
                style={{ maxWidth: '300px' }}
              />
              <button class="btn btn-secondary" onClick={loadRiddles}>Search</button>
            </div>

            <button class="btn" onClick={() => {
              setEditingRiddle(null);
              setRiddleForm({ question: '', answer: '', category: 'General Knowledge', difficulty: 'Easy', hint: '' });
              setShowRiddleModal(true);
            }}>
              + Add New Riddle
            </button>
          </div>

          {riddlesLoading ? (
            <div>Loading riddles...</div>
          ) : (
            <table class="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riddles.map((riddle) => (
                  <tr key={riddle._id}>
                    <td>{riddle.question}</td>
                    <td><code style={{ color: 'var(--accent)' }}>{riddle.answer}</code></td>
                    <td>{riddle.category}</td>
                    <td>
                      <span class={`badge badge-${riddle.difficulty.toLowerCase()}`}>
                        {riddle.difficulty}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }} onClick={() => openEditRiddle(riddle)}>
                        Edit
                      </button>
                      <button class="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDeleteRiddle(riddle._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 3. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div class="dashboard-section">
          <h2>Registered Users</h2>
          {usersLoading ? (
            <div>Loading users...</div>
          ) : (
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Games</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span class={`badge ${u.role === 'admin' ? 'badge-expert' : 'badge-easy'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: u.isActive ? '#4caf50' : '#f44336', fontWeight: '600' }}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{u.totalGamesPlayed}</td>
                    <td>
                      <button 
                        class="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}
                        onClick={() => handleToggleUserActive(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        class="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleToggleUserRole(u._id, u.role)}
                      >
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* RIDDLE MODAL */}
      {showRiddleModal && (
        <div class="modal-overlay">
          <div class="modal-card">
            <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
              {editingRiddle ? 'Edit Riddle' : 'Add New Riddle'}
            </h2>

            <form onSubmit={handleRiddleSubmit}>
              <div class="form-group">
                <label>Question</label>
                <input
                  type="text"
                  value={riddleForm.question}
                  onChange={e => setRiddleForm({ ...riddleForm, question: e.target.value })}
                  required
                />
              </div>

              <div class="form-group">
                <label>Answer (lowercase)</label>
                <input
                  type="text"
                  value={riddleForm.answer}
                  onChange={e => setRiddleForm({ ...riddleForm, answer: e.target.value })}
                  required
                />
              </div>

              <div class="form-group">
                <label>Category</label>
                <select
                  value={riddleForm.category}
                  onChange={e => setRiddleForm({ ...riddleForm, category: e.target.value })}
                >
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Science">Science</option>
                  <option value="Nature">Nature</option>
                  <option value="History">History</option>
                  <option value="Animals">Animals</option>
                  <option value="Technology">Technology</option>
                  <option value="Logic">Logic</option>
                  <option value="Programming">Programming</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Wordplay">Wordplay</option>
                </select>
              </div>

              <div class="form-group">
                <label>Difficulty</label>
                <select
                  value={riddleForm.difficulty}
                  onChange={e => setRiddleForm({ ...riddleForm, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div class="form-group">
                <label>Hint</label>
                <input
                  type="text"
                  value={riddleForm.hint}
                  onChange={e => setRiddleForm({ ...riddleForm, hint: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" class="btn btn-secondary" onClick={() => setShowRiddleModal(false)}>
                  Cancel
                </button>
                <button type="submit" class="btn">
                  Save Riddle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
