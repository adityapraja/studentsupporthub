const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('pendingEmail');
}

function logout() {
  clearAuth();
  window.location.href = '/';
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`
  };
}

async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: authHeaders()
  });
  if (response.status === 401) {
    logout();
    return null;
  }
  return response.json();
}

async function apiPost(endpoint, data) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    logout();
    return null;
  }
  return response.json();
}

async function apiPostForm(endpoint, formData) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData
  });
  if (response.status === 401) {
    logout();
    return null;
  }
  return response.json();
}

async function apiPut(endpoint, data) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
  if (response.status === 401) {
    logout();
    return null;
  }
  return response.json();
}

async function apiDelete(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (response.status === 401) {
    logout();
    return null;
  }
  return response.json();
}

function showAlert(containerId, message, type = 'error') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
