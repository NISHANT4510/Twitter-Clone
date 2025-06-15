import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import tweetService from '../services/tweet.service';
import ImageWithFallback from './ImageWithFallback';
import { Link } from 'react-router-dom';

const Comment = ({ comment }) => {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <div className="py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <Link to={`/profile/${comment.user.username}`}>
            <ImageWithFallback
              src={comment.user.profilePicture}
              fallbackSrc="https://via.placeholder.com/40"
              alt={comment.user.name}
              className="h-10 w-10 rounded-full border border-gray-200"
            />
          </Link>
        </div>
        <div className="flex-grow">
          <div className="flex items-center">
            <Link to={`/profile/${comment.user.username}`} className="font-semibold text-primary hover:underline">
              {comment.user.name}
            </Link>
            <span className="text-xs text-gray-700 ml-1">@{comment.user.username}</span>
            <span className="text-xs text-gray-700 ml-1">·</span>
            <span className="text-xs text-gray-700 ml-1">{formatDate(comment.createdAt)}</span>
          </div>
          <div className="text-sm text-primary mt-1">{comment.text}</div>
        </div>
      </div>
    </div>
  );
};

const CommentForm = ({ tweetId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const MAX_CHARS = 280;

  const handleChange = (e) => {
    setText(e.target.value);
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || text.length > MAX_CHARS) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Submitting comment to tweet ID:', tweetId);
      console.log('Comment text:', text);
      
      const response = await tweetService.addComment(tweetId, text);
      console.log('Comment response:', response);
      
      setText('');
      if (onCommentAdded && response.comment) {
        onCommentAdded(response.comment);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      console.error('Error details:', error.response || error);
      setError(error?.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex items-start border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Write your comment..."
          className="flex-grow p-3 focus:outline-none text-primary w-full"
          rows={2}
          disabled={isSubmitting}
          required
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-700 font-medium">
          {text.length}/{MAX_CHARS}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || text.trim().length === 0 || text.length > MAX_CHARS}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            isSubmitting || text.trim().length === 0 || text.length > MAX_CHARS
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>}
    </form>
  );
};

const CommentSection = ({ tweetId, isVisible = false }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const authState = useSelector(state => state.auth);
  const { isAuthenticated, user } = authState;
    
  console.log('CommentSection rendered for tweet ID:', tweetId, 'isVisible:', isVisible);
  console.log('Auth state from Redux:', authState, 'isAuthenticated:', isAuthenticated, 'user:', user);
  console.log('Token in localStorage:', !!localStorage.getItem('token'));
    
  // Check authentication status from multiple sources
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    const isAuthFromStorage = !!token;
    const isAuthFromRedux = isAuthenticated;
    
    console.log('Authentication check - Redux:', isAuthFromRedux, 'localStorage:', isAuthFromStorage);
    
    // Set authenticated if either Redux or localStorage indicates the user is logged in
    const finalAuthState = isAuthFromStorage || isAuthFromRedux;
    setIsUserAuthenticated(finalAuthState);
    setAuthChecked(true);
    
    console.log('Final auth state for comments:', finalAuthState);
  }, [isAuthenticated]);
    
  const fetchComments = async () => {
    setLoading(true);
    try {
      console.log('Fetching comments for tweet ID:', tweetId);
      const response = await api.get(`/tweets/${tweetId}/comments`);
      console.log('Comments response:', response.data);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      console.error('Error details:', error.response || error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Fetch comments whenever component becomes visible
    if (isVisible) {
      console.log('Comment section became visible, fetching comments...');
      fetchComments();
    }
  }, [isVisible, tweetId]);
  
  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
  };  return (
    <div className="mt-3 border-t border-gray-100 pt-3">      <h4 className="text-md font-semibold text-primary mb-3">Comments</h4>
      
      {/* Show comment form only if user is authenticated */}
      {isUserAuthenticated ? (
        <CommentForm tweetId={tweetId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center shadow-sm">
          <span className="text-primary font-medium">Please <a href="/login" className="text-blue-600 font-semibold hover:underline">sign in</a> to comment</span>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <span className="text-gray-500">Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="mt-4 border-t border-gray-50 pt-2">
          {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <span className="text-gray-500">No comments yet. Be the first to comment!</span>
        </div>
      )}
    </div>
  );
};

export { Comment, CommentForm, CommentSection };
