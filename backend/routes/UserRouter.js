import express from 'express';
import userController from '../controller/UserController.js';
import { authenticateToken } from '../Middleware/AuthMiddleware.js';

const router = express.Router();

// Get profile by username
router.get('/profile/:username', userController.getUserProfile);

// Create or update profile by email (for profile creation after signup)
router.post('/profile/create', userController.createOrUpdateProfile);

// Update user profile (protected route)
router.put('/profile', authenticateToken, userController.updateProfile);

// Follow/unfollow a user (protected route)
router.post('/follow/:userId', authenticateToken, userController.followUser);

// Get user's followers
router.get('/:username/followers', userController.getFollowers);

// Get users that a user is following
router.get('/:username/following', userController.getFollowing);

export default router;
