/**
 * Avatar Component — User Avatar
 * Display user avatar with fallback
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar source URL */
  src?: string;
  
  /** Alt text */
  alt?: string;
  
  /** Fallback text (initials) */
  fallback?: string;
  
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /** Shape */
  shape?: 'circle' | 'square';
}

/**
 * Avatar Component
 * 
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" fallback="JD" />
 * <Avatar fallback="AB" size="lg" />
 * ```
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      size = 'md',
      shape = 'circle',
      className = '',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    
    const baseClasses = `
      inline-flex items-center justify-center
      overflow-hidden
      bg-[var(--color-muted)]
      text-[var(--color-foreground)]
      font-medium
      flex-shrink-0
    `;
    
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };
    
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-md',
    };
    
    const showImage = src && !imageError;
    
    return (
      <div
        ref={ref}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${shapeClasses[shape]}
          ${className}
        `}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          <span>{fallback}</span>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-[var(--color-foreground-muted)]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
