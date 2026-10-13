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
  uploadProfileImage: (formData) => apiClient('/api/auth/profile/image', { method: 'POST', data: formData }),
  deleteProfileImage: () => apiClient('/api/auth/profile/image', { method: 'DELETE' }),
  deleteAccount: (data) => apiClient('/api/auth/account', { method: 'DELETE', data }),
};

export const dashboardApi = {
  getStats: () => apiClient('/api/dashboard/stats'),
};

export const projectsApi = {
  list: () => apiClient('/api/projects'),
  get: (id) => apiClient(`/api/projects/${id}`),
  create: (project) => apiClient('/api/projects', { method: 'POST', data: project }),
  update: (id, projectData) => apiClient(`/api/projects/${id}`, { method: 'PATCH', data: projectData }),
  delete: (id) => apiClient(`/api/projects/${id}`, { method: 'DELETE' }),
  listMembers: (projectId) => apiClient(`/api/projects/${projectId}/members`),
  addMember: (projectId, memberData) => apiClient(`/api/projects/${projectId}/members`, { method: 'POST', data: memberData }),
  removeMember: (projectId, memberId) => apiClient(`/api/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
};

export const tasksApi = {
  listAll: (params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiClient(`/api/tasks${qs ? `?${qs}` : ''}`);
  },
  listByProject: (projectId, params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiClient(`/api/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`);
  },
  create: (projectId, taskData) => apiClient(`/api/projects/${projectId}/tasks`, { method: 'POST', data: taskData }),
  update: (taskId, taskData) => apiClient(`/api/tasks/${taskId}`, { method: 'PATCH', data: taskData }),
  updateStatus: (taskId, status) => apiClient(`/api/tasks/${taskId}/status`, { method: 'PATCH', data: { status } }),
  delete: (taskId) => apiClient(`/api/tasks/${taskId}`, { method: 'DELETE' }),
};

export { apiClient };
