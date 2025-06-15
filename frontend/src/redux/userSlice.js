import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/user.service";

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  updateSuccess: false,
};

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (username, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile(username);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);

// Async thunk for creating a user profile
export const createUserProfile = createAsyncThunk(
  "user/createProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.createProfile(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create profile");
    }
  }
);

// Async thunk for following/unfollowing a user
export const toggleFollowUser = createAsyncThunk(
  "user/toggleFollow",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.toggleFollow(userId);
      return { 
        userId, 
        isFollowing: response.isFollowing 
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update follow status");
    }
  }
);

// Async thunk for getting a user's followers
export const fetchUserFollowers = createAsyncThunk(
  "user/fetchFollowers",
  async (username, { rejectWithValue }) => {
    try {
      const response = await userService.getFollowers(username);
      return response.followers;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch followers");
    }
  }
);

// Async thunk for getting users that a user is following
export const fetchUserFollowing = createAsyncThunk(
  "user/fetchFollowing",
  async (username, { rejectWithValue }) => {
    try {
      const response = await userService.getFollowing(username);
      return response.following;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch following users");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // If the error is that the profile wasn't found, we should allow creating one
        if (action.payload && action.payload.includes("not found")) {
          state.profile = null;
        }
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
        state.updateSuccess = true;

        // Also update the auth user if it's the same user
        const authState = JSON.parse(localStorage.getItem("user"));
        if (authState && authState.email === action.payload.email) {
          const updatedUserData = {
            ...authState,
            name: action.payload.name,
            email: action.payload.email,
            profilePicture: action.payload.profilePicture,
          };

          localStorage.setItem("user", JSON.stringify(updatedUserData));

          // Dispatch an action to update the auth state
          // Note: We'll have to handle this in the component
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create profile
      .addCase(createUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
        state.updateSuccess = true;

        // Update localStorage with profile data
        const authState = JSON.parse(localStorage.getItem("user"));
        if (authState && authState.email === action.payload.email) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...authState,
              name: action.payload.name,
              email: action.payload.email,
              username: action.payload.username,
              profilePicture: action.payload.profilePicture,
            })
          );
        }
      })      .addCase(createUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle follow
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        if (state.profile && state.profile._id === action.payload.userId) {
          // Update followers count in the profile if the toggle was successful
          if (action.payload.isFollowing) {
            // Add current user to followers
            state.profile.followers = [...(state.profile.followers || []), action.meta.arg.currentUserId];
          } else {
            // Remove current user from followers
            state.profile.followers = (state.profile.followers || [])
              .filter(id => id !== action.meta.arg.currentUserId);
          }
        }
      })
      // Fetch followers
      .addCase(fetchUserFollowers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.followersList = action.payload;
        }
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch following
      .addCase(fetchUserFollowing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.followingList = action.payload;
        }
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile, clearError, resetUpdateSuccess } =
  userSlice.actions;
export default userSlice.reducer;
