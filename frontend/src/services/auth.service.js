import api from './api';

const AUTH_URL = '/auth';

const signupUser = async (userData) => {
  try {
    console.log('Signup request data:', userData);
    const response = await api.post(`${AUTH_URL}/signup`, userData);
    console.log('Signup response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Signup error full:', error);
    //For General Error It return Whole Object
    if (error.response) {
      console.error('Signup error response:', error.response.data);
      throw new Error(error.response.data?.message || 'Server error during signup');
   //Error is from server side in terms of response code   
    } else if (error.request) {
      console.error('Signup error request:', error.request);
      throw new Error('No response received from server');
   //Request is sent but no response is received from the server
    } else {
      console.error('Signup error message:', error.message);
      throw new Error(error.message || 'An error occurred during signup');
    }
  }
};

const loginUser = async (credentials) => {
  try {
    const response = await api.post(`${AUTH_URL}/login`, credentials);
    
    // Save token and user data to localStorage
    if (response.data.jwtToken) {
      localStorage.setItem('token', response.data.jwtToken);
      localStorage.setItem('user', JSON.stringify({
        name: response.data.name,
        email: response.data.email
      }));
    }
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('An error occurred during login');
    }
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const authService = {
  signupUser,
  loginUser,
  logout,
  getCurrentUser,
  isAuthenticated
};

export default authService;