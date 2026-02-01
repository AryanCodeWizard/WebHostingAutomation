import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../services/cartService';

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.getCart();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item, { rejectWithValue }) => {
    try {
      const data = await cartService.addToCart(item);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const data = await cartService.updateCartItem(itemId, quantity);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.clearCart();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Helper function to calculate totals
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  },
  reducers: {
    clearCartErrors: (state) => {
      state.error = null;
    },
    // Local cart actions (for immediate UI feedback before API call)
    addItemLocally: (state, action) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    removeItemLocally: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.cart?.items || action.payload.cart?.items || [];
        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch cart';
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.cart?.items || action.payload.cart?.items || state.items;
        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add item to cart';
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.cart?.items || action.payload.cart?.items || state.items;
        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update cart item';
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.cart?.items || action.payload.cart?.items || [];
        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove item from cart';
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.subtotal = 0;
        state.tax = 0;
        state.total = 0;
        state.itemCount = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to clear cart';
      });
  },
});

export const { clearCartErrors, addItemLocally, removeItemLocally } = cartSlice.actions;
export default cartSlice.reducer;
