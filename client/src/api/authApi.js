import { apiRequest } from './client.js';

export function registerUser(data) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function loginUser(data) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function refreshTokens(refreshToken) {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function logoutUser(refreshToken) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
