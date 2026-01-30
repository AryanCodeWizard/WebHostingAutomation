import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const signup = createAsyncThunk(
    'user/signup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/signup', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const login = createAsyncThunk(
    'user/login',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const sendOtp = createAsyncThunk(
    'user/sendOtp',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/send-otp', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        loading: false,
        error: null
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                // You might want to store some flag that OTP was sent?
                // For now, valid response is enough for component to react
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
