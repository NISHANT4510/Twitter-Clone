import UserModel from '../models/user.js';

// Get user profile by username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username but don't return the password
    const user = await UserModel.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Create or update user profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the user by email
    let user = await UserModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email', success: false });
    }
    
    // If user has no username, create one from email
    if (!user.username) {
      user.username = email.split('@')[0];
    }
    
    // Update profile fields
    const { name, bio, website, profilePicture } = req.body;
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    await user.save();
    
    res.status(200).json({
      message: 'Profile created successfully',
      success: true,
      user: user.toObject({ virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret.password; return ret; } })
    });
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.user; // From the JWT token
    const { name, bio, website, email, profilePicture } = req.body;
    
    // Find the user
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    // Email updates require extra validation
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already in use by another account', 
          success: false 
        });
      }
      user.email = email;
    }
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await UserModel.findById(id).select('-password');
    
    res.status(200).json({
      message: 'Profile updated successfully',
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const { id, _id } = req.user; // Current user from JWT
    const { userId } = req.params; // User to follow
    
    console.log('==== FOLLOW ATTEMPT ====');
    console.log('Current user ID from token:', id);
    console.log('Current user _ID from token:', _id);
    console.log('User to follow ID:', userId);
    console.log('Request user object:', req.user);
    
    // Use either id or _id, depending on which is available
    const currentUserId = id || _id;
    
    if (!currentUserId) {
      console.error('No valid user ID found in token');
      return res.status(401).json({
        message: 'Invalid user identification',
        success: false
      });
    }
    
    // Check if trying to follow self
    if (currentUserId.toString() === userId.toString()) {
      console.log('User attempted to follow themselves');
      return res.status(400).json({
        message: 'You cannot follow yourself',
        success: false
      });
    }
    
    // Find both users
    console.log('Looking up current user with ID:', currentUserId);
    const currentUser = await UserModel.findById(currentUserId);
    console.log('Looking up target user with ID:', userId);
    const userToFollow = await UserModel.findById(userId);
    
    if (!currentUser) {
      console.error('Current user not found in database');
      return res.status(404).json({
        message: 'Current user not found',
        success: false
      });
    }
    
    if (!userToFollow) {
      console.error('Target user not found in database');
      return res.status(404).json({
        message: 'User to follow not found',
        success: false
      });
    }
    
    console.log('Current user:', currentUser.username);
    console.log('User to follow:', userToFollow.username);
    
    // Check if already following
    const isFollowing = currentUser.following.some(
      followingId => followingId.toString() === userId.toString()
    );
    console.log('Current following status:', isFollowing ? 'Following' : 'Not following');
      if (isFollowing) {
      console.log('Unfollowing user...');
      // Unfollow: remove from following list
      currentUser.following = currentUser.following.filter(
        followingId => followingId.toString() !== userId.toString()
      );
      // Remove from other user's followers list
      userToFollow.followers = userToFollow.followers.filter(
        followerId => followerId.toString() !== currentUserId.toString()
      );
    } else {
      console.log('Following user...');
      // Follow: add to following list
      currentUser.following.push(userId);
      // Add to other user's followers list
      userToFollow.followers.push(currentUserId);
    }
    
    // Save both users
    console.log('Saving current user with updated following list');
    await currentUser.save();
    console.log('Saving target user with updated followers list');
    await userToFollow.save();
    
    const newFollowingState = !isFollowing;
    console.log('New following state:', newFollowingState ? 'Following' : 'Not following');
    
    res.status(200).json({
      message: isFollowing ? 'User unfollowed successfully' : 'User followed successfully',
      success: true,
      isFollowing: newFollowingState
    });
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};

// Get user's followers
const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await UserModel.findOne({ username })
      .populate('followers', 'name username profilePicture');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }
    
    res.status(200).json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await UserModel.findOne({ username })
      .populate('following', 'name username profilePicture');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }
    
    res.status(200).json({
      success: true,
      following: user.following
    });
  } catch (error) {
    console.error('Error getting following users:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

export default {
  getUserProfile,
  updateProfile,
  createOrUpdateProfile,
  followUser,
  getFollowers,
  getFollowing
};
