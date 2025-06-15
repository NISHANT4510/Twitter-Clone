import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  createUserProfile, 
  resetUpdateSuccess,
  fetchUserFollowers,
  fetchUserFollowing
} from '../redux/userSlice';
import { updateUserData } from '../redux/authSlice';
import ImageWithFallback from '../components/ImageWithFallback';
import FollowButton from '../components/FollowButton';

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, isLoading, error, updateSuccess } = useSelector((state) => state.user);
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    website: '',
    profilePicture: ''
  });
    // State for handling profile not found situation
  const [createInitialProfile, setCreateInitialProfile] = useState(false);
    // Fetch user profile when component mounts
  useEffect(() => {
    if (username) {
      // Fetch the specified user's profile
      dispatch(fetchUserProfile(username));
      // Also fetch followers and following
      dispatch(fetchUserFollowers(username));
      dispatch(fetchUserFollowing(username));
    } else if (isAuthenticated && currentUser) {
      // If no username in URL but user is logged in, fetch their own profile
      dispatch(fetchUserProfile(currentUser.username));
      dispatch(fetchUserFollowers(currentUser.username));
      dispatch(fetchUserFollowing(currentUser.username));
    } else {
      // If not logged in and no username specified, redirect to login
      navigate('/login');
    }
  }, [dispatch, username, isAuthenticated, currentUser, navigate]);
  
  // Handle profile not found (404) and show create profile option
  useEffect(() => {
    if (error && error.includes('not found') && isAuthenticated) {
      // If profile not found but user is authenticated, show edit form to create profile
      setCreateInitialProfile(true);
      setIsEditMode(true);
      
      // Initialize form data with current user info from auth state
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          bio: '',
          website: '',
          profilePicture: currentUser.profilePicture || ''
        });
      }
    }
  }, [error, isAuthenticated, currentUser]);
  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        website: profile.website || '',
        profilePicture: profile.profilePicture || ''
      });
    }
  }, [profile]);

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && profile && currentUser.email === profile.email;
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation errors when the user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    // Validate profile picture URL
    if (formData.profilePicture && !isValidImageUrl(formData.profilePicture)) {
      errors.profilePicture = "Please enter a valid image URL (e.g., http(s)://example.com/image.jpg)";
    }
    
    // Validate website URL
    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = "Please enter a valid URL (e.g., http(s)://example.com)";
    }
    
    return errors;
  };
  
  // Validate image URL format
  const isValidImageUrl = (url) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
      return false;
    }
  };
  
  // Validate URL format
  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
      return false;
    }
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      let updatedProfile;
      
      // If this is initial profile creation
      if (createInitialProfile) {
        updatedProfile = await dispatch(createUserProfile(formData)).unwrap();
        setCreateInitialProfile(false);
      } else {
        updatedProfile = await dispatch(updateUserProfile(formData)).unwrap();
      }
      
      setIsEditMode(false);
      
      // If this is the current logged-in user, also update the auth state
      if (currentUser && currentUser.email === updatedProfile.email) {
        dispatch(updateUserData({
          name: updatedProfile.name,
          email: updatedProfile.email,
          username: updatedProfile.username,
          profilePicture: updatedProfile.profilePicture
        }));
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        dispatch(resetUpdateSuccess());
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };
  
  // Reset update success state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetUpdateSuccess());
    };
  }, [dispatch]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // Reset form data if canceling edit
    if (isEditMode && profile) {      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        website: profile.website || '',
        profilePicture: profile.profilePicture || ''
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error && !createInitialProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <p>{error}</p>
          <Link to="/home" className="text-blue-500 hover:text-blue-700 mt-2 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  if (!profile && !createInitialProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <p>User not found.</p>
          <Link to="/home" className="text-blue-500 hover:text-blue-700 mt-2 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  // If profile not found but we're set to create initial profile
  if (createInitialProfile && isEditMode) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">Welcome! Please set up your profile information.</p>
          </div>
          
          {/* Create profile form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${validationErrors?.name ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors?.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${validationErrors?.email ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors?.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-gray-700 mb-1 font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="profilePicture" className="block text-gray-700 mb-1 font-medium">
                Profile Picture URL
              </label>
              <div className="flex space-x-3 items-start">
                <div className="flex-grow">
                  <input
                    type="url"
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder="https://example.com/your-image.jpg"
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors?.profilePicture ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the URL of your profile picture</p>
                  {validationErrors?.profilePicture && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.profilePicture}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={formData.profilePicture}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    fallbackText={formData.name}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">        {/* Profile header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          {isOwnProfile && (
            <button
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded font-medium ${
                isEditMode
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isEditMode ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>
          {/* Success message */}
        {updateSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {createInitialProfile ? "Profile created successfully!" : "Profile updated successfully!"}
          </div>
        )}{/* Profile avatar */}
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <ImageWithFallback
              src={profile.profilePicture}
              alt={profile.name}
              className="w-full h-full object-cover"
              fallbackText={profile.name}
            />
          </div>
        </div>

        {isEditMode ? (
          /* Edit form */
          <form onSubmit={handleSubmit} className="space-y-4">            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-gray-700 mb-1 font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>              <div>
              <label htmlFor="website" className="block text-gray-700 mb-1 font-medium">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={`w-full px-3 py-2 border rounded-md ${validationErrors.website ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validationErrors.website && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.website}</p>
              )}
            </div>            <div>
              <label htmlFor="profilePicture" className="block text-gray-700 mb-1 font-medium">
                Profile Picture URL
              </label>
              <div className="flex space-x-3 items-start">
                <div className="flex-grow">
                  <input
                    type="url"
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder="https://example.com/your-image.jpg"
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.profilePicture ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the URL of your profile picture</p>
                  {validationErrors.profilePicture && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.profilePicture}</p>
                  )}
                </div>                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={formData.profilePicture}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    fallbackText={formData.name}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (          /* Profile display */          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-primary">{profile.name}</h2>
                <p className="text-secondary">@{profile.username}</p>
              </div>              {/* Follow button - show only if viewing someone else's profile */}
              {currentUser && profile && profile._id && 
               (currentUser._id !== profile._id && currentUser.id !== profile._id) && (
                <FollowButton 
                  userId={profile._id}
                  initialIsFollowing={
                    profile.followers?.some(
                      followerId => followerId === currentUser._id || followerId === currentUser.id
                    )
                  }
                />
              )}
            </div>
              <div className="flex space-x-4 text-sm">
              <div>
                <span className="font-bold text-primary">{profile.followers?.length || 0}</span>{' '}
                <span className="text-secondary">Followers</span>
              </div>
              <div>
                <span className="font-bold text-primary">{profile.following?.length || 0}</span>{' '}
                <span className="text-secondary">Following</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700">Email</h3>
              <p className="text-gray-600">{profile.email}</p>
            </div>
            
            {profile.bio && (
              <div>
                <h3 className="text-lg font-medium text-gray-700">Bio</h3>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}
            
            {profile.website && (
              <div>
                <h3 className="text-lg font-medium text-gray-700">Website</h3>
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {profile.website}
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Back to home link */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link to="/home" className="text-blue-500 hover:text-blue-700">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
