const API_BASE = '';

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function isLoggedIn() { return !!getToken(); }

const api = {
  auth: {
    register: (data) => request('POST', '/api/auth/register', data),
    login: (data) => request('POST', '/api/auth/login', data),
    me: () => request('GET', '/api/auth/me', null, true),
  },
  game: {
    getText: (difficulty) => request('GET', `/api/game/text?difficulty=${difficulty}`),
    submit: (data) => request('POST', '/api/game/submit', data, true),
    history: () => request('GET', '/api/game/history', null, true),
  },
  leaderboard: {
    get: (params = {}) => {
      const q = new URLSearchParams();
      if (params.difficulty) q.set('difficulty', params.difficulty);
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);
      return request('GET', `/api/leaderboard?${q}`);
    },
  },
};
