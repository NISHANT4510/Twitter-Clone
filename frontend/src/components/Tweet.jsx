import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { likeTweet, removeTweet } from '../redux/tweetSlice';
import ImageWithFallback from './ImageWithFallback';
import { CommentSection } from './CommentSection';

const Tweet = ({ tweet }) => {
  const dispatch = useDispatch();  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [showComments, setShowComments] = useState(false);
  
  // Additional check for authenticated state from localStorage as fallback
  const hasToken = !!localStorage.getItem('token');
  const effectiveAuthState = isAuthenticated || hasToken;
  
  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if the current user has liked this tweet
  const isLiked = user && tweet.likes && tweet.likes.some(id => id === user.id);
    // Check if the tweet belongs to the current user
  console.log('Tweet ownership check:', {
    userId: user?.id,
    userIdAsString: user?.id?.toString(),
    tweetUserId: tweet.user?._id,
    tweetUserIdAsString: tweet.user?._id?.toString(),
    tweetUser: tweet.user,
  });
    // More flexible ownership check with string comparison and multiple ID formats
  const isOwner = user && tweet.user && (
    // Compare ObjectId to string ID
    tweet.user._id === user.id || 
    tweet.user._id === user._id || 
    (tweet.user.id && tweet.user.id === user.id) ||
    // Compare string representations
    (tweet.user._id && user.id && tweet.user._id.toString() === user.id.toString()) ||
    (tweet.user.id && user.id && tweet.user.id.toString() === user.id.toString()) ||
    // Compare by username as fallback (tweet creator username matches current user's username)
    (tweet.user.username && user.username && tweet.user.username === user.username) ||
    // Email comparison as last resort
    (tweet.user.email && user.email && tweet.user.email === user.email)
  );
  
  console.log('Is owner of tweet:', isOwner);
  
  const handleLike = () => {
    dispatch(likeTweet(tweet._id));
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      dispatch(removeTweet(tweet._id));
    }
  };
    return (    <div className="bg-card p-4 border-b border-gray-200 hover:bg-gray-50 shadow-sm">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <Link to={`/profile/${tweet.user.username}`}>
            <ImageWithFallback
              src={tweet.user.profilePicture} 
              fallbackSrc="https://via.placeholder.com/40" 
              alt={tweet.user.name}
              className="h-10 w-10 rounded-full border border-gray-200"
            />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <Link to={`/profile/${tweet.user.username}`} className="font-medium text-primary hover:underline">
              {tweet.user.name}
            </Link>
            <span className="text-sm text-secondary ml-1">@{tweet.user.username}</span>
            <span className="text-sm text-muted ml-1">·</span>
            <span className="text-sm text-muted ml-1">{formatDate(tweet.createdAt)}</span>
          </div>          <div className="mt-1 text-base text-primary">{tweet.text}</div>
            {tweet.image && tweet.image.url && (
            <div className="mt-2">
              <img 
                src={tweet.image.url} 
                alt="Tweet image" 
                className="max-h-80 rounded-lg object-contain bg-gray-100"
              />
            </div>
          )}
            <div className="mt-2 flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center text-sm ${isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                viewBox="0 0 20 20" 
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isLiked ? "0" : "1.5"}
              >
                <path 
                  fillRule="evenodd" 
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{tweet.likesCount || 0}</span>
            </button>            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center text-sm text-gray-500 hover:text-blue-600"
              aria-label="Toggle comments"
              title={showComments ? "Hide comments" : "Show comments"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                viewBox="0 0 20 20" 
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <span>{tweet.comments?.length || 0} {showComments ? "Hide" : "Comment"}</span>
            </button>
              {isOwner ? (              <button 
                onClick={handleDelete}
                className="flex items-center text-sm bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium px-2 py-1 rounded-md"
                title="Delete this tweet"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>Delete</span>
              </button>
            ) : (
              // This is just to help with debugging - will not be visible in production
              <span className="hidden">Not owner</span>
            )}</div>
          
          {showComments && (
            <div className="mt-3 animate-fadeIn">
              <CommentSection tweetId={tweet._id} isVisible={showComments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tweet;
