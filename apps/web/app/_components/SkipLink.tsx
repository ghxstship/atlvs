'use client';

import { useState } from 'react';

export function SkipLink() {
  const [isVisible, setIsVisible] = useState(false);

  const handleSkip = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <a
      href="#main-content"
      className={`
        fixed top-4 left-4 z-50 px-md py-sm bg-primary text-primary-foreground rounded
        transform transition-transform duration-200 font-medium
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${isVisible ? 'translate-y-0' : '-translate-y-16'}
      `}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onClick={(e) => {
        e.preventDefault();
        handleSkip();
      }}
    >
      Skip to main content
    </a>
  );
}
