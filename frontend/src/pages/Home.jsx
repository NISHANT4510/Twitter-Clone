import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

const Home = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to Twitter Clone</h1>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-xl font-medium">Welcome, {user.name}!</p>
          <p className="text-gray-600">Logged in as: {user.email}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="mb-2 font-medium">This is your Home page.</p>
          <p className="text-gray-700">You've successfully logged in to the Twitter Clone application.</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
