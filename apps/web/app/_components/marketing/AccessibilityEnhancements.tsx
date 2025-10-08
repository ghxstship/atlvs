'use client';


import { useEffect, useState, useCallback } from 'react';

// Accessibility enhancement utilities
export const AccessibilityEnhancements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    // Skip links for keyboard navigation
    const createSkipLinks = () => {
      const skipLinksContainer = document.createElement('div');
      skipLinksContainer.className = 'skip-links';
      skipLinksContainer.innerHTML = `
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#navigation" class="skip-link">Skip to navigation</a>
        <a href="#footer" class="skip-link">Skip to footer</a>
      `;
      
      // Add styles for skip links
      const style = document.createElement('style');
      style.textContent = `
        .skip-links {
          position: absolute;
          top: -40px;
          left: 6px;
          z-index: 1000;
        }
        
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: hsl(var(--foreground));
          color: hsl(var(--background));
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          z-index: 1001;
          transition: top 0.3s;
        }
        
        .skip-link:focus {
          top: 6px;
        }
      `;
      
      document.head.appendChild(style);
      document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    };

    // Enhanced focus management
    const enhanceFocusManagement = () => {
      let focusedElementBeforeModal: HTMLElement | null = null;

      // Trap focus within modals
      const trapFocus = (element: HTMLElement) => {
        const focusableElements = element.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        element.addEventListener('keydown', (e: any) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
              }
            }
          }
        });
      };

      // Modal focus management
      const handleModalOpen = (modal: HTMLElement) => {
        focusedElementBeforeModal = document.activeElement as HTMLElement;
        modal.focus();
        trapFocus(modal);
      };

      const handleModalClose = () => {
        if (focusedElementBeforeModal) {
          focusedElementBeforeModal.focus();
        }
      };

      // Add event listeners for modals
      document.addEventListener('modal:open', (e: any) => {
        handleModalOpen(e.detail.modal);
      });

      document.addEventListener('modal:close', () => {
        handleModalClose();
      });
    };

    // Keyboard navigation enhancements
    const enhanceKeyboardNavigation = () => {
      // Add keyboard support for custom components
      document.addEventListener('keydown', (e: any) => {
        // Escape key handling
        if (e.key === 'Escape') {
          const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
          if (openModal) {
            const closeButton = openModal.querySelector('[data-close-modal]') as HTMLElement;
            if (closeButton) {
              closeButton.click();
            }
          }
        }

        // Arrow key navigation for menus
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const activeElement = document.activeElement;
          if (activeElement && activeElement.getAttribute('role') === 'menuitem') {
            e.preventDefault();
            const menu = activeElement.closest('[role="menu"]');
            if (menu) {
              const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
              const currentIndex = menuItems.indexOf(activeElement);
              let nextIndex;

              if (e.key === 'ArrowDown') {
                nextIndex = currentIndex + 1 >= menuItems.length ? 0 : currentIndex + 1;
              } else {
                nextIndex = currentIndex - 1 < 0 ? menuItems.length - 1 : currentIndex - 1;
              }

              (menuItems[nextIndex] as HTMLElement).focus();
            }
          }
        }
      });
    };

    // Screen reader announcements
    const createLiveRegion = () => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      
      const style = document.createElement('style');
      style.textContent = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(liveRegion);
    };

    // Color contrast validation
    const validateColorContrast = () => {
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        // Add warning for potential contrast issues
        if (backgroundColor !== 'transparent' && color !== 'transparent') {
          // This is a simplified check - in production, use a proper contrast ratio calculator
          const bgLuminance = getLuminance(backgroundColor);
          const textLuminance = getLuminance(color);
          const contrastRatio = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                               (Math.min(bgLuminance, textLuminance) + 0.05);
          
          if (contrastRatio < 4.5) {
            console.warn('Potential contrast issue detected:', element, `Ratio: ${contrastRatio.toFixed(2)}`);
          }
        }
      });
    };

    // Simplified luminance calculation
    const getLuminance = (color: string): number => {
      // This is a very simplified version - use a proper color library in production
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(x => {
        const val = parseInt(x) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    // Form accessibility enhancements
    const enhanceFormAccessibility = () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          // Ensure all inputs have labels
          const id = input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
          input.id = id;
          
          let label = form.querySelector(`label[for="${id}"]`);
          if (!label) {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
              input.setAttribute('aria-label', placeholder);
            }
          }

          // Add required field indicators
          if (input.hasAttribute('required')) {
            input.setAttribute('aria-required', 'true');
            
            // Add visual indicator if not present
            const requiredIndicator = form.querySelector(`[data-required-for="${id}"]`);
            if (!requiredIndicator && label) {
              const asterisk = document.createElement('span');
              asterisk.textContent = ' *';
              asterisk.setAttribute('aria-label', 'required');
              asterisk.className = 'color-destructive';
              label.appendChild(asterisk);
            }
          }
        });
      });
    };

    // Initialize all accessibility enhancements
    createSkipLinks();
    enhanceFocusManagement();
    enhanceKeyboardNavigation();
    createLiveRegion();
    enhanceFormAccessibility();

    // Run contrast validation in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(validateColorContrast, 1000);
    }

    // Announce page changes for SPAs
    const announcePageChange = () => {
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        const pageTitle = document.title;
        liveRegion.textContent = `Page changed to ${pageTitle}`;
        
        // Clear after announcement
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    };

    // Listen for route changes
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        announcePageChange();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to announce messages to screen readers
  const announceMessage = (message: string) => {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  return null;
};

// Hook for making announcements
export const useAnnouncements = () => {
  const announceMessage = (message: string) => {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  return { announceMessage };
};

// Accessible button component
export const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  [key: string];
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${className} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

export default AccessibilityEnhancements;
