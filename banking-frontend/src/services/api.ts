import axios from 'axios';

const API_BASE_URL = 'https://bankingapp-6ox5.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/';
      alert('Your session has expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const accountAPI = {
  createAccount: (email: string, accountType: 'CHECKING' | 'SAVINGS') =>
    api.post(`/accounts/create?email=${email}&accountType=${accountType}`),

  getUserAccounts: (email: string) =>
    api.get(`/accounts/user/${email}`),

  getBalance: (accountNumber: string) =>
    api.get(`/accounts/balance/${accountNumber}`),

  deactivateAccount: (accountNumber: string) =>
    api.put(`/accounts/deactivate/${accountNumber}`),
};

// Transaction endpoints
export const transactionAPI = {
  deposit: (accountNumber: string, amount: number, description?: string) =>
    api.post(
      `/transactions/deposit?accountNumber=${accountNumber}&amount=${amount}&description=${description || ''}`
    ),

  withdraw: (accountNumber: string, amount: number, description?: string) =>
    api.post(
      `/transactions/withdraw?accountNumber=${accountNumber}&amount=${amount}&description=${description || ''}`
    ),

  transfer: (data: {
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
  }) => api.post('/transactions/transfer', data),

  getHistory: (accountNumber: string) =>
    api.get(`/transactions/history/${accountNumber}`),

  updateCategory: (transactionId: number, category: string) =>
    api.put(`/transactions/${transactionId}/category`, { category }),
};

export const userAPI = {
  getProfile: (email: string) =>
    api.get(`/users/profile/${email}`),

  updateProfile: (email: string, data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => api.put(`/users/profile/${email}`, data),

  changePassword: (email: string, data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put(`/users/change-password/${email}`, data),
};

export default api;