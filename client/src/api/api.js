// client/src/api/api.js
// Centralized fetch API service wrapper

const API_BASE = 'https://prahelika-api.onrender.com/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('prahelika_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getMe: () => request('/auth/me'),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),

  // Riddles
  getRiddles: (category, difficulty, limit = 5) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (limit) params.append('limit', limit);
    return request(`/riddles?${params.toString()}`);
  },
  getCategories: () => request('/riddles/categories'),
  checkAnswer: (riddleId, answer) => request('/riddles/check-answer', { method: 'POST', body: { riddleId, answer } }),

  // Games
  saveGameResult: (resultData) => request('/games/result', { method: 'POST', body: resultData }),

  // User Dashboard
  getUserStats: () => request('/users/me/stats'),
  getRecentGames: () => request('/users/me/recent-games'),
  updateProfile: (body) => request('/users/me/profile', { method: 'PUT', body }),

  // Leaderboard
  getLeaderboard: (period = 'all') => request(`/leaderboard?period=${period}`),

  // Achievements
  getAchievements: () => request('/achievements'),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminRiddles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/riddles?${query}`);
  },
  createRiddle: (body) => request('/admin/riddles', { method: 'POST', body }),
  updateRiddle: (id, body) => request(`/admin/riddles/${id}`, { method: 'PUT', body }),
  deleteRiddle: (id) => request(`/admin/riddles/${id}`, { method: 'DELETE' }),
  getAdminUsers: () => request('/admin/users'),
  updateUserRoleOrStatus: (id, body) => request(`/admin/users/${id}`, { method: 'PATCH', body }),

  // Version 3: AI Features
  generateAIRiddles: (params) => request('/ai/riddles/generate', { method: 'POST', body: params }),
  getAIProgressiveHint: (riddleId, level, riddleObj) => request(`/ai/riddles/${riddleId}/hints`, { method: 'POST', body: { level, riddle: riddleObj } }),
  evaluateAIAnswer: (riddleId, answer, isFinalAttempt, riddleObj) => request(`/ai/riddles/${riddleId}/evaluate`, { method: 'POST', body: { answer, isFinalAttempt, riddle: riddleObj } }),
  getAIRiddleExplanation: (riddleId, riddleObj) => request(`/ai/riddles/${riddleId}/explanation`, { method: 'POST', body: { riddle: riddleObj } }),
  sendAIRiddleChat: (riddleId, message, history, isAnswerRevealed, riddleObj) => request(`/ai/riddles/${riddleId}/chat`, { method: 'POST', body: { message, history, isAnswerRevealed, riddle: riddleObj } }),
  getAIPersonalizedRecommendation: () => request('/ai/personalize'),
};
