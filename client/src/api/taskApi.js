import { apiRequest } from './client.js';

export function getTasks(teamId, params = {}) {
  const searchParams = new URLSearchParams({ team_id: String(teamId) });

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.only_my) {
    searchParams.set('only_my', 'true');
  }

  return apiRequest(`/tasks?${searchParams.toString()}`);
}

export function createTask(data) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTask(taskId, data) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteTask(taskId) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export function submitTaskForReview(taskId) {
  return apiRequest(`/tasks/${taskId}/submit-for-review`, {
    method: 'POST',
  });
}

export function changeTaskStatus(taskId, data) {
  return apiRequest(`/tasks/${taskId}/change-status`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
