'use client';

import { useState } from 'react';
import { Button } from '@ghxstship/ui/components/Button';
import { cn } from '@ghxstship/ui/system';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'inline' | 'centered';
  placeholder?: string;
  buttonText?: string;
  showSuccess?: boolean;
}

export function NewsletterSignup({ 
  className,
  variant = 'default',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  showSuccess = true
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading || isSubscribed) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (showSuccess) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    default: 'flex flex-col sm:flex-row gap-md max-w-md',
    inline: 'flex gap-sm max-w-sm',
    centered: 'flex flex-col sm:flex-row gap-md max-w-md mx-auto',
  };

  if (isSubscribed && showSuccess) {
    return (
      <div className={cn(variants[variant], className)}>
        <div className="text-center color-success form-label">
          ✓ Successfully subscribed!
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(variants[variant], className)}>
      <div className="flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="w-full px-md py-sm rounded-md border border-input bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          disabled={isLoading}
          required
        />
        {error && (
          <p className="text-body-sm color-error mt-1">{error}</p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !email}
        className={variant === 'inline' ? 'shrink-0' : ''}
      >
        {isLoading ? 'Subscribing...' : buttonText}
      </Button>
    </form>
  );
}
