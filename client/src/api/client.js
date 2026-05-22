import { clearAuthData, getAccessToken } from '../utils/auth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function buildUrl(endpoint) {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  return `${API_URL}${endpoint}`;
}

function normalizeError(detail, fallback) {
  if (!detail) {
    return fallback;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = Array.isArray(item.loc) ? item.loc.join('.') : '';
        return `${location ? `${location}: ` : ''}${item.msg || 'Ошибка валидации'}`;
      })
      .join('\n');
  }

  return fallback;
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthData();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = normalizeError(errorData?.detail, `Ошибка запроса: ${response.status}`);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
