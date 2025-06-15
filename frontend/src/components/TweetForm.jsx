import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postTweet, clearPostStatus } from '../redux/tweetSlice';

const TweetForm = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { posting, postSuccess, postError } = useSelector(state => state.tweets);
  
  const MAX_CHARS = 280;
    // Clear form and status when a tweet is posted successfully
  useEffect(() => {
    if (postSuccess) {
      setText('');
      setCharCount(0);
      setImage(null);
      setImagePreview(null);
      dispatch(clearPostStatus());
    }
  }, [postSuccess, dispatch]);
    const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!text.trim() || text.length > MAX_CHARS) {
      return;
    }
    
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('text', text);
    
    if (image) {
      formData.append('image', image);
    }
    
    dispatch(postTweet(formData));
  };
  
  // Calculate character count status color
  const getCharCountColor = () => {
    if (charCount > MAX_CHARS - 20) {
      return charCount > MAX_CHARS ? 'text-red-600' : 'text-yellow-600';
    }
    return 'text-gray-500';
  };
    return (
    <div className="bg-card p-4 border border-gray-200 rounded-lg mb-4 shadow-sm">
      <form onSubmit={handleSubmit}>        <textarea
          value={text}
          onChange={handleChange}
          placeholder="What's happening?"
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-primary"
          rows={3}
          disabled={posting}
          required
        />
        
        {imagePreview && (
          <div className="relative mt-2">
            <img 
              src={imagePreview} 
              alt="Tweet image preview" 
              className="max-h-64 rounded-lg object-contain bg-gray-100"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-75 text-white rounded-full"
              title="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
          <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <div className={getCharCountColor()}>
              {charCount}/{MAX_CHARS}
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="tweet-image-upload"
            />
            
            <label 
              htmlFor="tweet-image-upload" 
              className="ml-4 cursor-pointer text-blue-500 hover:text-blue-600"
              title="Add image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={posting || text.trim().length === 0 || charCount > MAX_CHARS}
            className={`px-4 py-2 rounded-full font-medium ${
              posting || text.trim().length === 0 || charCount > MAX_CHARS
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {posting ? 'Posting...' : 'Tweet'}
          </button>
        </div>
        
        {postError && (
          <div className="mt-2 text-red-500 text-sm">
            {postError}
          </div>
        )}
      </form>
    </div>
  );
};

export default TweetForm;
