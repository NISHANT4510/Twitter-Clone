import api from './api';

// Create a new tweet
const createTweet = async (tweetData) => {
  try {
    // tweetData can be either a plain object or FormData (when image is included)
    const response = await api.post('/tweets', tweetData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add a comment to a tweet
const addComment = async (tweetId, commentText) => {
  try {
    console.log('Tweet service - Adding comment to tweet:', tweetId);
    console.log('Tweet service - Comment text:', commentText);
    
    // Validate inputs
    if (!tweetId) {
      console.error('Tweet service - Missing tweet ID for comment');
      throw new Error('Tweet ID is required');
    }
    
    if (!commentText || !commentText.trim()) {
      console.error('Tweet service - Empty comment text');
      throw new Error('Comment text is required');
    }
    
    // Create payload with correct structure
    const payload = { text: commentText.trim() };
    console.log('Tweet service - Request payload:', payload);
    
    // Get token to verify auth status
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Tweet service - No authentication token found');
      throw new Error('You must be logged in to comment');
    }
    
    const response = await api.post(`/tweets/${tweetId}/comments`, payload);
    console.log('Tweet service - Comment response:', response.data);
    
    if (!response.data || !response.data.success) {
      console.error('Tweet service - Unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'Failed to add comment');
    }
    
    return response.data;
  } catch (error) {
    console.error('Tweet service - Error adding comment:', error);
    if (error.response) {
      console.error('Tweet service - Server response:', error.response.data);
      console.error('Tweet service - Status code:', error.response.status);
    } else if (error.request) {
      console.error('Tweet service - No response received from server');
    } else {
      console.error('Tweet service - Request setup error:', error.message);
    }
    throw error;
  }
};

// Get comments for a tweet
const getComments = async (tweetId) => {
  try {
    const response = await api.get(`/tweets/${tweetId}/comments`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get tweets for the feed
const getFeed = async () => {
  try {
    const response = await api.get('/tweets/feed');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get tweets from a specific user
const getUserTweets = async (username) => {
  try {
    const response = await api.get(`/tweets/user/${username}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Like or unlike a tweet
const toggleLike = async (tweetId) => {
  try {
    const response = await api.post(`/tweets/like/${tweetId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a tweet
const deleteTweet = async (tweetId) => {
  try {
    const response = await api.delete(`/tweets/${tweetId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  createTweet,
  getFeed,
  getUserTweets,
  toggleLike,
  deleteTweet,
  addComment,
  getComments
};
