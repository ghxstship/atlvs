'use client';


import { useState } from 'react';
import { Button, Input, cn } from '@ghxstship/ui';

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
    default: 'flex flex-col sm:flex-row gap-lg max-w-md',
    inline: 'flex gap-lg max-w-sm',
    centered: 'flex flex-col sm:flex-row gap-lg max-w-md mx-auto'
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
        <Input 
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder={placeholder}
          size="default"
          disabled={isLoading}
          required
          error={error}
          className="w-full"
        />
      </div>
      <Button 
        type="submit" 
        size="default"
        disabled={isLoading || !email}
        className={variant === 'inline' ? 'shrink-0' : ''}
      >
        {isLoading ? 'Subscribing...' : buttonText}
      </Button>
    </form>
  );
}
