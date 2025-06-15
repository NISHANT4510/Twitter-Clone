import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const FollowButton = ({ userId, initialIsFollowing = false, onFollowChange = () => {} }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
    // Using useEffect to handle state properly
  useEffect(() => {
    if (initialIsFollowing !== undefined) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing]);
  
  // Don't show follow button on own profile or if not logged in
  if (!isAuthenticated || !user || (user && (user._id === userId || user.id === userId))) {
    return null;
  }
  const handleFollowClick = async () => {
    setIsLoading(true);
    try {
      console.log('Follow button clicked for user ID:', userId);
      
      // Get the userService without dynamic import to avoid potential issues
      const userService = (await import('../services/user.service')).default;
      console.log('User service loaded, calling toggleFollow');
      
      const response = await userService.toggleFollow(userId);
      console.log('Follow toggle response:', response);
      
      if (response && response.success) {
        console.log('Follow toggle successful, new state:', response.isFollowing);
        setIsFollowing(response.isFollowing);
        onFollowChange(response.isFollowing);
      } else {
        console.error('Follow response was not successful:', response);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      console.error('Error details:', error.response || error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleFollowClick}
      disabled={isLoading}
      className={`px-4 py-1 rounded-full font-medium text-sm ${
        isFollowing
          ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } transition-colors`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
