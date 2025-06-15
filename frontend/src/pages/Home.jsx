import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import TweetForm from '../components/TweetForm';
import TweetFeed from '../components/TweetFeed';

const Home = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Get token from localStorage as backup auth check
  const token = localStorage.getItem('token');
  const effectiveAuthState = isAuthenticated || !!token;
  
  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    console.log('Home page - Auth check:', { 
      reduxAuth: isAuthenticated, 
      localStorageToken: !!token,
      effectiveAuth: effectiveAuthState
    });
    
    if (!effectiveAuthState) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [effectiveAuthState, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }
  // Check if user is newly signed up (within the last few minutes)
  const [isNewUser, setIsNewUser] = useState(false);
  
  useEffect(() => {
    // Check localStorage for newSignup flag
    const newSignupFlag = localStorage.getItem('userProfile');
    if (newSignupFlag) {
      setIsNewUser(true);
      // Clear the flag
      localStorage.removeItem('userProfile');
    }
  }, []);
    return (
    <div className="container mx-auto p-6">
      <div className="border-b-gray-900 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Twitter Clone</h1>
        
        {isNewUser && (
          <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium">Welcome to Twitter Clone!</p>
            <p className="mt-1">You're all set up. Visit your profile to add more details.</p>
            <Link to="/profile" className="mt-2 inline-block text-blue-700 font-medium underline">
              Complete your profile &rarr;
            </Link>
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-xl font-medium">Welcome, {user.name}!</p>
          <p className="text-gray-600">@{user.username}</p>
          <div className="mt-2">
            <Link to="/profile" className="text-blue-500 hover:text-blue-700 inline-block mr-2">
              View/Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 inline-block"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Create a Tweet</h2>
          <TweetForm />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Tweet Feed</h2>
          <TweetFeed />
        </div>
      </div>
    </div>
  );
};

export default Home;
