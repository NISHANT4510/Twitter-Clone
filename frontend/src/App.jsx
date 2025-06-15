import React, { useEffect } from 'react'
import './index.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Header from './components/Header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Debug helper function - accessible in browser console as window.debugAuth()
const setupDebugHelper = () => {
  if (typeof window !== 'undefined') {
    window.debugAuth = () => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('token');
      
      console.log('===== DEBUG AUTH STATE =====');
      console.log('User from localStorage:', user);
      console.log('Token exists:', !!token);
      console.log('User ID:', user.id);
      console.log('User _id:', user._id);
      console.log('========================');
      
      return { user, hasToken: !!token };
    };
    
    console.log('Debug helper installed. Run window.debugAuth() in console to check auth state.');
  }
};

function App() {
  // Set up debug helper on first render
  useEffect(() => {
    setupDebugHelper();
  }, []);

  return (
    <div className='App'>
      <Header />
      <main className="pt-4">
        <Routes>
          <Route path='/' element={<Navigate to ="/home"/>} /> 
          <Route path='/login' element={<Login/>} /> 
          <Route path='/signup' element={<Signup/>} /> 
          <Route path='/home' element={<Home/>} /> 
          <Route path='/profile/:username' element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
