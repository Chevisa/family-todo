import { apiRequest } from './client.js';

export function getMyProfile() {
  return apiRequest('/users/me');
}

export function updateMyProfile(data) {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
