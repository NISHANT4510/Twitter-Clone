import TweetModel from '../models/tweet.js';
import UserModel from '../models/user.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinaryConfig.js';
import fs from 'fs/promises';

// Create a new tweet
const createTweet = async (req, res) => {
  try {
    const { id } = req.user; // From JWT token
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: 'Tweet text is required',
        success: false
      });
    }

    if (text.length > 280) {
      return res.status(400).json({
        message: 'Tweet cannot exceed 280 characters',
        success: false
      });
    }
    
    // Create a new tweet object
    const newTweet = new TweetModel({
      user: id,
      text
    });
    
    // If there's an image uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.path, 'twitter_clone/tweets');
        
        if (cloudinaryResult.success) {
          // Store Cloudinary URL and publicId in the tweet
          newTweet.image = {
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.public_id
          };
          
          // Delete the local file after successful upload
          await fs.unlink(req.file.path).catch(err => 
            console.warn('Warning: Could not delete local file:', err)
          );
        } else {
          console.error('Error uploading to Cloudinary:', cloudinaryResult.error);
        }
      } catch (uploadError) {
        console.error('Error in image upload process:', uploadError);
      }
    }
    
    await newTweet.save();
    
    // Populate user info before sending response
    const populatedTweet = await TweetModel.findById(newTweet._id)
                                         .populate('user', 'name username profilePicture');
    
    res.status(201).json({
      message: 'Tweet created successfully',
      success: true,
      tweet: populatedTweet
    });
    
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Get all tweets (feed)
const getFeed = async (req, res) => {
  try {
    // Get most recent tweets first
    const tweets = await TweetModel.find()
                                 .sort({ createdAt: -1 })
                                 .populate('user', 'name username profilePicture')
                                 .limit(50); // Limit to 50 most recent tweets
    
    res.status(200).json({
      success: true,
      tweets
    });
  } catch (error) {
    console.error('Error fetching tweets feed:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Get tweets from a specific user
const getUserTweets = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find the user first
    const user = await UserModel.findOne({ username });
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }
    
    // Get user's tweets
    const tweets = await TweetModel.find({ user: user._id })
                                 .sort({ createdAt: -1 })
                                 .populate('user', 'name username profilePicture');
    
    res.status(200).json({
      success: true,
      tweets
    });
  } catch (error) {
    console.error('Error fetching user tweets:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Like a tweet
const likeTweet = async (req, res) => {
  try {
    const { id } = req.user; // From JWT token
    const { tweetId } = req.params;
    
    const tweet = await TweetModel.findById(tweetId);
    
    if (!tweet) {
      return res.status(404).json({
        message: 'Tweet not found',
        success: false
      });
    }
    
    // Check if user already liked this tweet
    const alreadyLiked = tweet.likes.includes(id);
    
    if (alreadyLiked) {
      // Unlike the tweet
      tweet.likes = tweet.likes.filter(userId => userId.toString() !== id.toString());
    } else {
      // Like the tweet
      tweet.likes.push(id);
    }
    
    await tweet.save();
    
    res.status(200).json({
      message: alreadyLiked ? 'Tweet unliked' : 'Tweet liked',
      success: true,
      liked: !alreadyLiked,
      likesCount: tweet.likes.length
    });
  } catch (error) {
    console.error('Error liking/unliking tweet:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Delete a tweet
const deleteTweet = async (req, res) => {
  try {
    const { id } = req.user; // From JWT token
    const { tweetId } = req.params;
    
    const tweet = await TweetModel.findById(tweetId);
    
    if (!tweet) {
      return res.status(404).json({
        message: 'Tweet not found',
        success: false
      });
    }    // Log ownership info for debugging
    console.log('Tweet delete ownership check:', {
      requestUserId: id,
      tweetUserId: tweet.user,
      tweetUserIdStr: tweet.user.toString()
    });
    
    // Check if the user is the owner of the tweet
    if (tweet.user.toString() !== id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this tweet',
        success: false
      });
    }
    
    // If the tweet has an image, delete it from Cloudinary
    if (tweet.image && tweet.image.publicId) {
      try {
        await deleteFromCloudinary(tweet.image.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with tweet deletion even if image deletion fails
      }
    }
    
    await TweetModel.findByIdAndDelete(tweetId);
    
    res.status(200).json({
      message: 'Tweet deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Add a comment to a tweet
const addComment = async (req, res) => {
  try {
    const { id, _id } = req.user; // From JWT token
    const { tweetId } = req.params;
    const { text } = req.body;
    
    console.log('==== COMMENT ATTEMPT ====');
    console.log('User ID from token:', id);
    console.log('User _ID from token:', _id);
    console.log('Tweet ID:', tweetId);
    console.log('Comment text:', text);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    if (!text || text.trim().length === 0) {
      console.log('Error: Comment text is empty');
      return res.status(400).json({
        message: 'Comment text is required',
        success: false
      });
    }

    if (text.length > 280) {
      console.log('Error: Comment text exceeds character limit');
      return res.status(400).json({
        message: 'Comment cannot exceed 280 characters',
        success: false
      });
    }
    
    // Use correct user ID (either id or _id)
    const userId = id || _id;
    if (!userId) {
      console.log('Error: No user ID available in token');
      return res.status(400).json({
        message: 'User identification missing',
        success: false
      });
    }
    
    // Validate tweetId format
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      console.log('Error: Invalid tweet ID format');
      return res.status(400).json({
        message: 'Invalid tweet ID format',
        success: false
      });
    }
    
    console.log('Looking for tweet with ID:', tweetId);
    const tweet = await TweetModel.findById(tweetId);
    
    if (!tweet) {
      console.log('Error: Tweet not found');
      return res.status(404).json({
        message: 'Tweet not found',
        success: false
      });
    }
    
    console.log('Found tweet:', tweet._id);
    
    // Create the comment object
    const newCommentObj = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };
    
    // Add the comment
    tweet.comments.push(newCommentObj);
    
    // Save the tweet with the new comment
    const savedTweet = await tweet.save();
    console.log('Tweet saved with new comment', savedTweet._id);
    
    // Get the newly added comment with populated user data
    const populatedTweet = await TweetModel.findById(tweetId)
      .populate('comments.user', 'name username profilePicture');
    
    // Make sure we have comments
    if (!populatedTweet.comments || populatedTweet.comments.length === 0) {
      console.log('Error: No comments found after saving');
      return res.status(500).json({
        message: 'Failed to save comment',
        success: false
      });
    }
    
    // Get the newly added comment
    const newComment = populatedTweet.comments[populatedTweet.comments.length - 1];
    
    console.log('Comment added successfully:', {
      id: newComment._id,
      text: newComment.text,
      user: newComment.user._id,
      username: newComment.user.username
    });
    
    res.status(201).json({
      message: 'Comment added successfully',
      success: true,
      comment: newComment
    });
    
  } catch (error) {
    console.error('Error adding comment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};

// Get comments for a tweet
const getComments = async (req, res) => {
  try {
    const { tweetId } = req.params;
    
    console.log('==== GET COMMENTS ====');
    console.log('Tweet ID:', tweetId);
    
    const tweet = await TweetModel.findById(tweetId)
      .populate('comments.user', 'name username profilePicture');
    
    if (!tweet) {
      console.log('Error: Tweet not found');
      return res.status(404).json({
        message: 'Tweet not found',
        success: false
      });
    }
    
    console.log('Found tweet:', tweet._id);
    console.log('Comments count:', tweet.comments.length);
    console.log('Comments:', tweet.comments.map(c => ({
      id: c._id,
      user: c.user?._id || c.user,
      text: c.text.substring(0, 30) + (c.text.length > 30 ? '...' : '')
    })));
    
    res.status(200).json({
      success: true,
      comments: tweet.comments
    });
    
  } catch (error) {
    console.error('Error getting comments:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};

export default {
  createTweet,
  getFeed,
  getUserTweets,
  likeTweet,
  deleteTweet,
  addComment,
  getComments
};
