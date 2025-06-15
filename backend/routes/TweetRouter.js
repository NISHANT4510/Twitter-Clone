import express from 'express';
import tweetController from '../controller/TweetController.js';
import { authenticateToken } from '../Middleware/AuthMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Create a new tweet (protected route) with optional image upload
router.post('/', authenticateToken, upload.single('image'), tweetController.createTweet);

// Get all tweets for feed
router.get('/feed', tweetController.getFeed);

// Get tweets from a specific user by username
router.get('/user/:username', tweetController.getUserTweets);

// Like/unlike a tweet (protected route)
router.post('/like/:tweetId', authenticateToken, tweetController.likeTweet);

// Delete a tweet (protected route)
router.delete('/:tweetId', authenticateToken, tweetController.deleteTweet);

// Add comment to a tweet (protected route)
router.post('/:tweetId/comments', authenticateToken, tweetController.addComment);

// Get comments for a tweet
router.get('/:tweetId/comments', tweetController.getComments);

export default router;
