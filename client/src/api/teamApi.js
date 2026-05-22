import { apiRequest } from './client.js';

export function getTeams() {
  return apiRequest('/teams');
}

export function createTeam(data) {
  return apiRequest('/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getTeamById(teamId) {
  return apiRequest(`/teams/${teamId}`);
}

export function addMemberToTeam(teamId, data) {
  return apiRequest(`/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMemberRole(teamId, userId, data) {
  return apiRequest(`/teams/${teamId}/members/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function removeMemberFromTeam(teamId, userId) {
  return apiRequest(`/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
  });
}
