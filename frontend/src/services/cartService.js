import axiosInstance from './axiosConfig';

// Cart Service - All cart related API calls
const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (item) => {
    const response = await axiosInstance.post('/cart/add', item);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await axiosInstance.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    const response = await axiosInstance.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  },
};

export default cartService;
