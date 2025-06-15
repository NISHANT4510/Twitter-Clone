import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import tweetReducer from './tweetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    tweets: tweetReducer,
  },
});
