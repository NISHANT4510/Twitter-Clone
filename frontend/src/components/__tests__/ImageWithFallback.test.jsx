import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageWithFallback from '../ImageWithFallback';

describe('ImageWithFallback Component', () => {
  test('renders the image when src is valid', () => {
    render(
      <ImageWithFallback 
        src="https://valid-image-url.com/image.jpg"
        alt="Test image"
        className="test-class"
        fallbackText="Test"
      />
    );
    
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img.className).toBe('test-class');
    expect(img.src).toBe('https://valid-image-url.com/image.jpg');
  });
  
  test('renders fallback when src is not provided', () => {
    render(
      <ImageWithFallback 
        src=""
        alt="Test image"
        className="test-class"
        fallbackText="Test"
      />
    );
    
    const fallbackDiv = screen.getByText('T');
    expect(fallbackDiv).toBeInTheDocument();
  });
  
  test('renders fallback when image errors', () => {
    render(
      <ImageWithFallback 
        src="https://invalid-url.com/image.jpg"
        alt="Test image"
        className="test-class"
        fallbackText="Test"
      />
    );
    
    const img = screen.getByAltText('Test image');
    fireEvent.error(img);
    
    const fallbackDiv = screen.getByText('T');
    expect(fallbackDiv).toBeInTheDocument();
  });
  
  test('uses first letter of fallbackText for fallback content', () => {
    render(
      <ImageWithFallback 
        src=""
        alt="Test image"
        className="test-class"
        fallbackText="John"
      />
    );
    
    const fallbackContent = screen.getByText('J');
    expect(fallbackContent).toBeInTheDocument();
  });
  
  test('uses default letter U when fallbackText is not provided', () => {
    render(
      <ImageWithFallback 
        src=""
        alt="Test image"
        className="test-class"
      />
    );
    
    const fallbackContent = screen.getByText('U');
    expect(fallbackContent).toBeInTheDocument();
  });
});
