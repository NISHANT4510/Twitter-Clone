import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, fallbackText }) => {
  const [imgError, setImgError] = useState(false);
  
  const firstLetter = fallbackText ? fallbackText.charAt(0).toUpperCase() : 'U';
  
  const handleError = () => {
    setImgError(true);
  };
  
  if (imgError || !src) {
    return (
      <div className={`bg-gray-300 flex items-center justify-center ${className}`}>
        <span className="font-bold text-gray-600 text-center" style={{ fontSize: '40%' }}>
          {firstLetter}
        </span>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
