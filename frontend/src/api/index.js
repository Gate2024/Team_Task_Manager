/**
 * API service endpoints.
 */

import { apiClient } from './client';

export const authApi = {
  login: (credentials) => apiClient('/api/auth/login', { method: 'POST', data: credentials }),
  register: (userData) => apiClient('/api/auth/register', { method: 'POST', data: userData }),
  logout: () => apiClient('/api/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiClient('/api/auth/me'),
  updateProfile: (profileData) => apiClient('/api/auth/profile', { method: 'PATCH', data: profileData }),
};

export const dashboardApi = {
  getStats: () => apiClient('/api/dashboard/stats'),
};

export const projectsApi = {
  list: () => apiClient('/api/projects'),
  get: (id) => apiClient(`/api/projects/${id}`),
  create: (project) => apiClient('/api/projects', { method: 'POST', data: project }),
  addMember: (projectId, memberData) => apiClient(`/api/projects/${projectId}/members`, { method: 'POST', data: memberData }),
  removeMember: (projectId, memberId) => apiClient(`/api/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
};

export const tasksApi = {
  listAll: () => apiClient('/api/tasks'),
  listByProject: (projectId) => apiClient(`/api/projects/${projectId}/tasks`),
  create: (projectId, taskData) => apiClient(`/api/projects/${projectId}/tasks`, { method: 'POST', data: taskData }),
  updateStatus: (taskId, status) => apiClient(`/api/tasks/${taskId}/status`, { method: 'PATCH', data: { status } }),
  delete: (taskId) => apiClient(`/api/tasks/${taskId}`, { method: 'DELETE' }),
};

export { apiClient };
