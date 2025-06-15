import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/auth.service";

// Get user from localStorage to maintain state across refreshes
const user = JSON.parse(localStorage.getItem("user")) || null;
const token = localStorage.getItem("token") || null;

// Log the initial auth state from localStorage
console.log("Auth State Initialization:", {
  hasToken: !!token,
  hasUser: !!user,
  tokenValue: token ? "Token exists" : "No token"
});

// Ensure we have a properly initialized state
const initialState = {
  isAuthenticated: !!token, // Convert token to boolean
  user: user,
  token: token,
  isLoading: false,
  error: null,
};

// Async thunks for login and signup
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginUser(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Auth slice: signup called with", userData);
      const response = await authService.signupUser(userData);
      console.log("Auth slice: signup response", response);
      return response;
    } catch (error) {
      console.error("Auth slice: signup error", error);
      return rejectWithValue(error.message || "Signup failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserData: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.jwtToken || localStorage.getItem('token');
        state.user = {
          id: action.payload.id || action.payload._id,
          _id: action.payload.id || action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          username: action.payload.username || action.payload.email
        };
        state.error = null;
        console.log('Login successful, user authenticated:', state.isAuthenticated);
        console.log('Auth state after login:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasToken: !!state.token
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        console.log('Logout successful, auth state cleared');
      });
  },
});

export const { clearError, updateUserData } = authSlice.actions;
export default authSlice.reducer;
