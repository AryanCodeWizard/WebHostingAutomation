import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/userSlice';
import cartReducer from './features/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
