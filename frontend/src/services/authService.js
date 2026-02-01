import axiosInstance from './axiosConfig';

// Auth Service - All authentication related API calls
const authService = {
  // Send OTP to email
  sendOtp: async (email) => {
    const response = await axiosInstance.post('/auth/send-otp', { email });
    return response.data;
  },

  // Signup new user
  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Reset password
  resetPassword: async (data) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axiosInstance.post('/auth/change-password', data);
    return response.data;
  },
};

export default authService;
