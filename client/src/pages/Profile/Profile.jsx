// client/src/pages/Profile/Profile.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/api';
import './Profile.css';

export function Profile() {
  const { user, updateUserState } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const data = await api.updateProfile({ name });
      updateUserState(data.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div class="container">
      <div class="profile-card">
        <div class="profile-avatar">{initial}</div>
        <h2>{user?.name}</h2>
        <p>{user?.email} • Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>

        <form onSubmit={handleUpdate}>
          <div class="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>

          {message && <div class="feedback-msg feedback-correct">{message}</div>}
          {error && <div class="feedback-msg feedback-incorrect">{error}</div>}

          <button type="submit" class="btn" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
