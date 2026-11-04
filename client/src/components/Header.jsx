// client/src/components/Header.jsx

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header class="site-header">
      <div class="header-container">
        <Link to="/" class="logo">
          <span class="logo-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
            </svg>
          </span>
          prahelikā
        </Link>

        <nav>
          <ul class="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Home</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/game" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 0-.253 1.02l.363 1.246c.253.87-.143 1.905-.895 2.657-.962.96-2.278 1.16-3.23.407l-1.05-.826a.976.976 0 0 0-1.376.154l-.763.953c-.672.84-1.69 1.157-2.604.83l-1.376-.492a.978.978 0 0 0-1.07.252l-1.442 1.442c-.566.566-1.282.849-1.998.849s-1.432-.283-1.998-.849c-1.1-1.1-1.1-2.896 0-3.996l1.442-1.442a.978.978 0 0 0 .252-1.07l-.492-1.376c-.327-.914-.01-1.932.83-2.604l.953-.763a.976.976 0 0 0 .154-1.376l-.826-1.05c-.754-.952-.553-2.268.407-3.23.751-.752 1.786-1.148 2.657-.895l1.246.363a.98.98 0 0 0 1.02-.253l1.611-1.611c.47-.47 1.087-.706 1.704-.706s1.233.235 1.704.706l1.568 1.568c.23.23.556.338.878.289.923-.14 1.838.214 2.506.883.74.74 1.045 1.802.798 2.755Z"/>
                </svg>
                <span>Game</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
                <span>Leaderboard</span>
              </NavLink>
            </li>

            {isAuthenticated ? (
              <>
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="7" height="9" x="3" y="3" rx="1"/>
                      <rect width="7" height="5" x="14" y="3" rx="1"/>
                      <rect width="7" height="9" x="14" y="12" rx="1"/>
                      <rect width="7" height="5" x="3" y="16" rx="1"/>
                    </svg>
                    <span>Dashboard</span>
                  </NavLink>
                </li>

                {isAdmin && (
                  <li>
                    <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span>Admin</span>
                    </NavLink>
                  </li>
                )}

                <li>
                  <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Profile</span>
                  </NavLink>
                </li>

                <li>
                  <button onClick={handleLogout} class="logout-btn" title="Logout">
                    Logout ({user?.name?.split(' ')[0]})
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" x2="3" y1="12" y2="12"/>
                    </svg>
                    <span>Login</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" x2="19" y1="8" y2="14"/>
                      <line x1="22" x2="16" y1="11" y2="11"/>
                    </svg>
                    <span>Register</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
