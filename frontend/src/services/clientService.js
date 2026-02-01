import api from './axiosConfig';

const clientService = {
  // Get current user's client profile
  getMyProfile: async () => {
    const response = await api.get('/clients/me');
    return response.data.data;
  },

  // Update current user's client profile
  updateMyProfile: async (profileData) => {
    const response = await api.put('/clients/me', profileData);
    return response.data.data;
  },
};

export default clientService;
