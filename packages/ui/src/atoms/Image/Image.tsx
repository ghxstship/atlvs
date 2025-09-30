'use client';

import React, { useState, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const imageVariants = cva('', {
  variants: {
    variant: {
      default: '',
      rounded: 'rounded-md',
      circle: 'rounded-full',
      thumbnail: 'rounded-sm',
    },
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
      scaleDown: 'object-scale-down',
    },
  },
  defaultVariants: {
    variant: 'default',
    fit: 'cover',
  },
});

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>,
    VariantProps<typeof imageVariants> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  containerClassName?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({
    src,
    alt,
    fallbackSrc,
    lazy = true,
    variant,
    fit,
    className,
    containerClassName,
    onLoad,
    onError,
    ...props
  }, ref) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
      setIsLoading(false);
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
      } else {
        setHasError(true);
        onError?.();
      }
    }, [fallbackSrc, currentSrc, onError]);

    if (hasError) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground text-sm',
            containerClassName
          )}
          style={{ width: props.width, height: props.height }}
        >
          Failed to load
        </div>
      );
    }

    return (
      <div className={cn('relative overflow-hidden', containerClassName)}>
        {isLoading && (
          <div
            className="absolute inset-0 bg-muted animate-pulse"
            style={{ width: props.width, height: props.height }}
          />
        )}
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          className={cn(
            imageVariants({ variant, fit }),
            isLoading && 'opacity-0',
            !isLoading && 'opacity-100 transition-opacity duration-200',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }
);

Image.displayName = 'Image';

export type { ImageProps };
