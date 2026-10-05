import axios from 'axios';

const getApiBaseUrl = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:8086/api').trim();
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gulli_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified Error Response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An error occurred';

    if (status === 401) {
      localStorage.removeItem('gulli_token');
      localStorage.removeItem('gulli_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
};

// Team API
export const teamApi = {
  getAll: () => api.get('/teams').then(r => r.data),
  getById: (id) => api.get(`/teams/${id}`).then(r => r.data),
  create: (data) => api.post('/teams', data).then(r => r.data),
  update: (id, data) => api.put(`/teams/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/teams/${id}`).then(r => r.data),
  getTeamPlayers: (teamId) => api.get(`/teams/${teamId}/players`).then(r => r.data),
  addTeamPlayer: (teamId, data) => api.post(`/teams/${teamId}/players`, data).then(r => r.data),
};

// Match API
export const matchApi = {
  getAll: (status) => api.get('/matches', { params: { status } }).then(r => r.data),
  getById: (id) => api.get(`/matches/${id}`).then(r => r.data),
  create: (data) => api.post('/matches', data).then(r => r.data),
  recordToss: (id, tossData) => api.post(`/matches/${id}/toss`, tossData).then(r => r.data),
  setPlayingXI: (id, xiData) => api.post(`/matches/${id}/playing-xi`, xiData).then(r => r.data),
  updateStatus: (id, status) => api.put(`/matches/${id}/status`, { status }).then(r => r.data),
  delete: (id) => api.delete(`/matches/${id}`).then(r => r.data),
};

// Live Scoring API
export const scoringApi = {
  recordBall: (matchId, ballEvent) => api.post(`/scoring/${matchId}/ball`, ballEvent).then(r => r.data),
  undoBall: (matchId) => api.post(`/scoring/${matchId}/undo`).then(r => r.data),
  getScorecard: (matchId) => api.get(`/scoring/${matchId}/scorecard`).then(r => r.data),
  setBowler: (matchId, bowlerName) => api.post(`/scoring/${matchId}/set-bowler`, { bowlerName }).then(r => r.data),
  setupInnings2: (matchId, data) => api.post(`/scoring/${matchId}/innings2-setup`, data).then(r => r.data),
  swapStrike: (matchId) => api.post(`/scoring/${matchId}/swap-strike`).then(r => r.data),
};

// Player API
export const playerApi = {
  getAll: (team, teamId) => api.get('/players', { params: { team, teamId } }).then(r => r.data),
  getById: (id) => api.get(`/players/${id}`).then(r => r.data),
  getByTeam: (team) => api.get(`/players/team/${encodeURIComponent(team)}`).then(r => r.data),
  create: (data) => api.post('/players', data).then(r => r.data),
  update: (id, data) => api.put(`/players/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/players/${id}`).then(r => r.data),
};

// Stats API
export const statsApi = {
  getDashboardStats: () => api.get('/stats/dashboard').then(r => r.data),
  getLeaderboard: () => api.get('/stats/leaderboard').then(r => r.data),
};

export default api;
