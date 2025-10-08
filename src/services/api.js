import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const jobsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    return api.get(`/jobs?${params.toString()}`);
  },
  getById: (id) => api.get(`/jobs/${id}`),
  create: (jobData) => api.post('/jobs', jobData),
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  delete: (id) => api.delete(`/jobs/${id}`),
  // question endpoints removed - questions feature disabled
};

export const applicationsAPI = {
  apply: (jobId, formData) => {
    return api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getByJob: (jobId) => api.get(`/applications/job/${jobId}`),
  getMyApplications: () => api.get('/applications/my'),
};

export default api;
