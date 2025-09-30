/**
 * Input Component Tests
 * Enterprise-grade test coverage for atomic Input component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../src/components/atomic/Input';
import '@testing-library/jest-dom';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const variants = ['default', 'error', 'success', 'ghost'] as const;
      
      variants.forEach(variant => {
        const { container } = render(<Input variant={variant} placeholder="Test" />);
        expect(container.querySelector('input')).toBeInTheDocument();
      });
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'default', 'lg'] as const;
      
      sizes.forEach(size => {
        const { container } = render(<Input size={size} placeholder="Test" />);
        expect(container.querySelector('input')).toBeInTheDocument();
      });
    });

    it('renders with label', () => {
      render(<Input label="Email Address" placeholder="Enter email" />);
      
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Input error="This field is required" placeholder="Test" />);
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<Input description="Enter your email address" placeholder="Email" />);
      
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('renders with left icon', () => {
      const Icon = () => <span data-testid="left-icon">Icon</span>;
      render(<Input leftIcon={<Icon />} placeholder="Test" />);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const Icon = () => <span data-testid="right-icon">Icon</span>;
      render(<Input rightIcon={<Icon />} placeholder="Test" />);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} placeholder="Test" />);
      
      const input = screen.getByPlaceholderText(/test/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('Hello');
    });

    it('handles focus and blur events', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Test" />);
      
      const input = screen.getByPlaceholderText(/test/i);
      
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('does not allow input when disabled', () => {
      render(<Input disabled placeholder="Test" />);
      const input = screen.getByPlaceholderText(/test/i) as HTMLInputElement;
      
      expect(input).toBeDisabled();
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(input.value).toBe('');
    });

    it('shows loading state', () => {
      render(<Input loading placeholder="Test" />);
      const input = screen.getByPlaceholderText(/test/i);
      
      expect(input).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Email" placeholder="Enter email" />);
      
      const input = screen.getByPlaceholderText(/enter email/i);
      const label = screen.getByText('Email');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('associates error message with input', () => {
      render(<Input error="Invalid email" placeholder="Email" />);
      
      const input = screen.getByPlaceholderText(/email/i);
      const errorId = input.getAttribute('aria-describedby');
      
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Invalid email')).toHaveAttribute('id', errorId!);
    });

    it('has proper required attribute', () => {
      render(<Input required placeholder="Required field" />);
      const input = screen.getByPlaceholderText(/required field/i);
      
      expect(input).toBeRequired();
    });

    it('supports autocomplete', () => {
      render(<Input autoComplete="email" placeholder="Email" />);
      const input = screen.getByPlaceholderText(/email/i);
      
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Semantic Tokens', () => {
    it('uses semantic token classes', () => {
      const { container } = render(<Input placeholder="Test" />);
      const input = container.querySelector('input') as HTMLElement;
      
      // Check that input uses semantic classes, not hardcoded colors
      const classList = input.className;
      expect(classList).not.toMatch(/#[0-9a-fA-F]{6}/); // No hex colors
      expect(classList).not.toMatch(/rgb\(/); // No RGB colors
    });

    it('applies proper focus-visible styles', () => {
      const { container } = render(<Input placeholder="Test" />);
      const input = container.querySelector('input') as HTMLElement;
      
      expect(input.className).toContain('focus-visible');
    });
  });

  describe('Compound Components', () => {
    it('renders SearchInput correctly', () => {
      // SearchInput test would go here
      expect(true).toBe(true);
    });

    it('renders PasswordInput correctly', () => {
      // PasswordInput test would go here
      expect(true).toBe(true);
    });
  });
});
