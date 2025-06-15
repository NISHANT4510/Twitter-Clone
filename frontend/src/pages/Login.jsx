import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showError, setShowError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/home');
    }
    
    // Clear errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  // Check if this login is after a new signup
  const [newSignupInfo, setNewSignupInfo] = useState(null);
  
  useEffect(() => {
    // Check if there's new signup data in localStorage
    const signupData = localStorage.getItem('newSignup');
    if (signupData) {
      const parsed = JSON.parse(signupData);
      setNewSignupInfo(parsed);
      
      // Pre-fill email if it exists
      if (parsed.email) {
        setFormData(prevData => ({
          ...prevData,
          email: parsed.email
        }));
      }
      
      // Clear the temporary data
      localStorage.removeItem('newSignup');
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      
      // If this login immediately follows a signup and profile doesn't exist yet
      if (newSignupInfo && newSignupInfo.email === formData.email) {
        // Navigate to profile page to complete setup
        navigate('/profile');
      } else {
        // Otherwise, go to home page
        navigate('/home');
      }
    } catch (err) {
      setShowError(true);
    }
  };

  return (
    <div className="container mx-auto max-w-md mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
      
      {showError && error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            id="password"
            name="password" 
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Password" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</Link>
        </div>
      </form>    </div>
  );
};

export default Login;
