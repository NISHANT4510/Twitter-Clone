import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import ImageWithFallback from './ImageWithFallback';

const Header = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Additional check to ensure auth state is consistent with localStorage
  const token = localStorage.getItem('token');
  const effectiveAuthState = isAuthenticated || !!token;
  
  console.log('Header component - Auth state:', { 
    reduxAuth: isAuthenticated, 
    localStorageToken: !!token,
    effectiveAuth: effectiveAuthState
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/home" className="text-xl font-bold text-white">Twitter Clone</Link>
        
        {effectiveAuthState ? (
          <div className="flex items-center space-x-4">
            <Link to="/home" className="text-white font-medium hover:text-blue-200">Home</Link>
            <Link to="/profile" className="text-white font-medium hover:text-blue-200">Profile</Link>
            <button 
              onClick={handleLogout}
              className="bg-white text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium"
            >
              Logout
            </button>
              <Link to="/profile" className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                <ImageWithFallback
                  src={user?.profilePicture}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  fallbackText={user?.name}
                />
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-x-2">
            <Link 
              to="/login"
              className="bg-white text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium"
            >
              Login
            </Link>
            <Link 
              to="/signup"
              className="bg-white text-blue-600 hover:bg-blue-600 px-3 py-1 rounded-md text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
