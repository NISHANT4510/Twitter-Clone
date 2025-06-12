import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/auth.service";

// Get user from localStorage to maintain state across refreshes
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const initialState = {
  isAuthenticated: !!token,
  user: user || null,
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
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          name: action.payload.name,
          email: action.payload.email,
        };
        state.error = null;
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
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
