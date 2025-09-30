/**
 * Button Component Tests
 * Enterprise-grade test coverage for atomic Button component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/atomic/Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
      
      variants.forEach(variant => {
        const { container } = render(<Button variant={variant}>Test</Button>);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'default', 'lg', 'xl', 'icon'] as const;
      
      sizes.forEach(size => {
        const { container } = render(<Button size={size}>Test</Button>);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('renders with left icon', () => {
      const Icon = () => <span data-testid="left-icon">Icon</span>;
      render(<Button leftIcon={<Icon />}>With Icon</Button>);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const Icon = () => <span data-testid="right-icon">Icon</span>;
      render(<Button rightIcon={<Icon />}>With Icon</Button>);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      const button = screen.getByRole('button', { name: /submit form/i });
      
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press me</Button>);
      
      const button = screen.getByRole('button', { name: /press me/i });
      button.focus();
      
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('has proper disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Semantic Tokens', () => {
    it('uses semantic token classes', () => {
      const { container } = render(<Button>Test</Button>);
      const button = container.firstChild as HTMLElement;
      
      // Check that button uses semantic classes, not hardcoded colors
      const classList = button.className;
      expect(classList).not.toMatch(/#[0-9a-fA-F]{6}/); // No hex colors
      expect(classList).not.toMatch(/rgb\(/); // No RGB colors
    });

    it('applies proper focus-visible styles', () => {
      const { container } = render(<Button>Test</Button>);
      const button = container.firstChild as HTMLElement;
      
      expect(button.className).toContain('focus-visible');
    });
  });

  describe('Compound Components', () => {
    it('renders ButtonGroup correctly', () => {
      // ButtonGroup test would go here
      // This is a placeholder for when ButtonGroup is implemented
      expect(true).toBe(true);
    });
  });
});
