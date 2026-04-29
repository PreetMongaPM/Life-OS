import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Automatically append /api if the user forgot it in their environment variable
if (import.meta.env.VITE_API_URL && !apiUrl.endsWith('/api')) {
  // Remove trailing slash if present before appending /api
  apiUrl = apiUrl.replace(/\/$/, '') + '/api';
}

const API = axios.create({
  baseURL: apiUrl,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifeos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lifeos_token');
      localStorage.removeItem('lifeos_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => API.post(`/auth/reset-password/${token}`, data);

// Tasks
export const getTasks = () => API.get('/tasks');
export const createTask = (task) => API.post('/tasks', task);
export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Habits
export const getHabits = () => API.get('/habits');
export const createHabit = (habit) => API.post('/habits', habit);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const toggleHabit = (id, date) => API.post(`/habits/${id}/toggle`, { date });

// Notes
export const getNotes = () => API.get('/notes');
export const createNote = (note) => API.post('/notes', note);
export const updateNote = (id, data) => API.put(`/notes/${id}`, data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

// Events
export const getEvents = () => API.get('/events');
export const createEvent = (event) => API.post('/events', event);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// Transactions
export const getTransactions = () => API.get('/transactions');
export const createTransaction = (transaction) => API.post('/transactions', transaction);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

export default API;
