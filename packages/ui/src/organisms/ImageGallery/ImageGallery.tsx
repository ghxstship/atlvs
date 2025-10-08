/**
 * ImageGallery Component — Image Gallery
 * Display and navigate through images
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

export interface ImageGalleryProps {
  /** Images */
  images: GalleryImage[];
  
  /** Initial image index */
  initialIndex?: number;
  
  /** Close handler */
  onClose?: () => void;
}

/**
 * ImageGallery Component
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [zoom, setZoom] = React.useState(1);
  
  const currentImage = images[currentIndex];
  
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape' && onClose) onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="text-white">
          <div className="font-semibold">{currentImage.title || currentImage.alt}</div>
          <div className="text-sm text-white/70">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-white/10 text-white transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
      
      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="
              absolute left-4 top-1/2 -translate-y-1/2
              p-3 rounded-full bg-black/50 hover:bg-black/70
              text-white transition-colors
            "
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              p-3 rounded-full bg-black/50 hover:bg-black/70
              text-white transition-colors
            "
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-4 bg-black/50 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentIndex(index);
                setZoom(1);
              }}
              className={`
                flex-shrink-0 w-20 h-20 rounded overflow-hidden
                border-2 transition-all
                ${index === currentIndex
                  ? 'border-white'
                  : 'border-transparent hover:border-white/50'
                }
              `}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ImageGallery.displayName = 'ImageGallery';
