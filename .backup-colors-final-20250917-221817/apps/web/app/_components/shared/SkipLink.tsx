'use client';

import React from "react";

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
        fixed top-md left-md z-50 px-md py-sm bg-primary color-primary-foreground rounded
        transform transition-transform duration-200 form-label
        focus:outline-none focus:ring-primary ring-primary focus:ring-primary focus:ring-primary focus:ring-ring focus:ring-offset-2
        ${isVisible ? 'translate-y-0' : '-translate-y-16'}
      `}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onClick={(e: React.FormEvent) => {
        e.preventDefault();
        handleSkip();
      }}
    >
      Skip to main content
    </a>
  );
}
