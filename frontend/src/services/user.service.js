import api from './api';

const USER_URL = '/users';

const getUserProfile = async (username) => {
  try {
    // If username is not provided, try to use email
    if (!username) {
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      if (!currentUser.name) {
        throw new Error('No username provided for profile lookup');
      }
      username = currentUser.name;
    }
    
    const response = await api.get(`${USER_URL}/profile/${username}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Special handling for 404 - profile not found
      const errorMessage = 'User profile not found';
      console.log('Profile not found, this is expected for new users');
      throw new Error(errorMessage);
    } else if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch user profile');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
};

const updateProfile = async (profileData) => {
  try {
    const response = await api.put(`${USER_URL}/profile`, profileData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to update profile');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
};

const createProfile = async (profileData) => {
  try {
    const response = await api.post(`${USER_URL}/profile/create`, profileData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to create profile');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
};

// Follow or unfollow a user
const toggleFollow = async (userId) => {
  try {
    // Ensure we have a valid userId
    if (!userId) {
      console.error('No user ID provided for follow/unfollow');
      throw new Error('User ID is required to follow/unfollow');
    }
    
    console.log('User service - Toggling follow for user ID:', userId);
    
    const response = await api.post(`/users/follow/${userId}`);
    console.log('User service - Follow response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('User service - Toggle follow error:', error);
    if (error.response) {
      console.error('User service - Server response:', error.response.data);
      console.error('User service - Status code:', error.response.status);
      throw new Error(error.response.data.message || 'Failed to toggle follow status');
    } else if (error.request) {
      console.error('User service - No response received');
      throw new Error('No response received from server when trying to follow/unfollow');
    } else {
      console.error('User service - Error:', error.message);
      throw error;
    }
  }
};

// Get a user's followers
const getFollowers = async (username) => {
  try {
    const response = await api.get(`/users/${username}/followers`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get users that a user is following
const getFollowing = async (username) => {
  try {
    const response = await api.get(`/users/${username}/following`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const userService = {
  getUserProfile,
  updateProfile,
  createProfile,
  toggleFollow,
  getFollowers,
  getFollowing
};

export default userService;
