import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Profile from '../Profile';
import { fetchUserProfile, updateUserProfile } from '../../redux/userSlice';

// Mock Redux
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ username: 'testuser' }),
  useNavigate: () => jest.fn(),
}));

// Mock the async thunks
jest.mock('../../redux/userSlice', () => ({
  fetchUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  resetUpdateSuccess: jest.fn(),
}));

describe('Profile Component', () => {
  let store;
  
  beforeEach(() => {
    // Set up initial state
    store = mockStore({
      user: {
        profile: {
          name: 'Test User',
          email: 'test@example.com',
          bio: 'Test bio',
          website: 'https://example.com',
          profilePicture: 'https://example.com/image.jpg',
          username: 'testuser'
        },
        isLoading: false,
        error: null,
        updateSuccess: false
      },
      auth: {
        isAuthenticated: true,
        user: {
          name: 'Test User',
          email: 'test@example.com',
          profilePicture: 'https://example.com/image.jpg'
        }
      }
    });
    
    // Mock the thunks
    fetchUserProfile.mockImplementation(() => () => Promise.resolve());
    updateUserProfile.mockImplementation(() => () => Promise.resolve());
  });
  
  test('renders profile information correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if profile information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
  
  test('allows editing the profile', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );
    
    // Click the edit button
    fireEvent.click(screen.getByText('Edit Profile'));
    
    // Check if form elements are displayed
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    
    // Edit the name field
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Updated Name' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if updateUserProfile was called
    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
    });
  });
  
  test('shows validation errors for invalid inputs', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>
    );
    
    // Click the edit button
    fireEvent.click(screen.getByText('Edit Profile'));
    
    // Clear the name field (which is required)
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '' }
    });
    
    // Enter an invalid email
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if validation errors are displayed
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });
});
