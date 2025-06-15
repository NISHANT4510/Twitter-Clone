import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ProtectedRoute from '../ProtectedRoute';

// Mock Redux store
const mockStore = configureStore([]);

// Mock components for testing
const ProtectedComponent = () => <div>Protected Content</div>;
const TestComponent = () => (
  <div>
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <ProtectedComponent />
        </ProtectedRoute>
      } />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  </div>
);

describe('ProtectedRoute Component', () => {
  let store;
  
  test('renders children when authenticated', () => {
    // Set up authenticated store
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User' }
      }
    });
    
    // Use MemoryRouter to set initial route
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if protected content is shown
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  test('redirects to login when not authenticated', () => {
    // Set up non-authenticated store
    store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null
      }
    });
    
    // Mock navigation
    Object.defineProperty(window, 'location', {
      value: { pathname: '/login' },
      writable: true,
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if redirected to login page
    expect(window.location.pathname).toBe('/login');
  });
});
