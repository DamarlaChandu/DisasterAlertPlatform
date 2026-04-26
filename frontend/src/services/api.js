import apiClient from './apiClient';

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => apiClient.get('/profile/me'),
  updateProfile: (data) => apiClient.put('/profile/me', data),
  updateImage: (imageUrl) => apiClient.put('/profile/image', { imageUrl }),
  changePassword: (data) => apiClient.put('/profile/password', data),
  getAllUsers: (role) => apiClient.get('/profile/users', { params: { role } }),
  deactivateUser: (userId) => apiClient.put(`/profile/deactivate/${userId}`),
  activateUser: (userId) => apiClient.put(`/profile/activate/${userId}`),
};

// Alert APIs
export const alertAPI = {
  createReport: (data) => apiClient.post('/alerts', data),
  getReports: (filters) => apiClient.get('/alerts', { params: filters }),
  getReportById: (reportId) => apiClient.get(`/alerts/${reportId}`),
  acceptDisasterMission: (reportId) => apiClient.post(`/coordination/accept-mission/${reportId}`),
  updateReport: (reportId, data) => apiClient.put(`/alerts/${reportId}`, data),
  getNearbyDisasters: (longitude, latitude, radius = 10) =>
    apiClient.get('/alerts/nearby', { params: { longitude, latitude, radius } }),
  getActiveCount: () => apiClient.get('/alerts/count/active'),
  deleteReport: (reportId) => apiClient.delete(`/alerts/${reportId}`),
};

// Resource APIs
export const resourceAPI = {
  createRequest: (data) => apiClient.post('/resources', data),
  getRequests: (filters) => apiClient.get('/resources', { params: filters }),
  getRequestById: (requestId) => apiClient.get(`/resources/${requestId}`),
  getNearbyRequests: (longitude, latitude, radius = 10) =>
    apiClient.get('/resources/nearby', { params: { longitude, latitude, radius } }),
  acceptRequest: (requestId) => apiClient.post(`/resources/${requestId}/accept`),
  updateStatus: (requestId, data) => apiClient.put(`/resources/${requestId}/status`, data),
  addProgress: (requestId, data) => apiClient.post(`/resources/${requestId}/progress`, data),
  completeRequest: (requestId, data) => apiClient.post(`/resources/${requestId}/complete`, data),
  getMyRequests: () => apiClient.get('/resources/my/requests'),
  getMyResponses: () => apiClient.get('/resources/my/responses'),
  assignPriority: (requestId, priority) =>
    apiClient.put(`/resources/${requestId}/priority`, { priority }),
  getCoordinationStatus: () => apiClient.get('/resources/admin/status'),
  getHighPriority: () => apiClient.get('/resources/admin/high-priority'),
  cancelRequest: (requestId, reason) =>
    apiClient.post(`/resources/${requestId}/cancel`, { reason }),
  getPendingCount: () => apiClient.get('/resources/count/pending'),
};

// Coordination APIs
export const coordinationAPI = {
  addProgressUpdate: (responseId, data) =>
    apiClient.post(`/coordination/${responseId}/progress`, data),
  rateVolunteer: (responseId, data) => apiClient.post(`/coordination/${responseId}/rate`, data),
  getVolunteerStats: (volunteerId) =>
    apiClient.get(`/coordination/volunteer/${volunteerId}/stats`),
  getStatus: () => apiClient.get('/coordination/admin/status'),
  getHighPriority: () => apiClient.get('/coordination/admin/high-priority'),
  cancelRequest: (requestId, reason) =>
    apiClient.post(`/coordination/${requestId}/cancel`, { reason }),
};
