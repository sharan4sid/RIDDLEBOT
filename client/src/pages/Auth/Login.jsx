// client/src/pages/Auth/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="container">
      <div class="auth-container">
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your prahelikā account</p>
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

          <div class="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div class="feedback-msg feedback-incorrect">{error}</div>}

          <button type="submit" class="btn" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
