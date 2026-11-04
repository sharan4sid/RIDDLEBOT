// client/src/pages/Auth/ForgotPassword.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api';
import './Auth.css';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = await api.forgotPassword({ email });
      setMessage(data.message);
    } catch (err) {
      setMessage('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="container">
      <div class="auth-container">
        <div class="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your email to receive password reset instructions</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          {message && <div class="feedback-msg feedback-correct">{message}</div>}

          <button type="submit" class="btn" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
