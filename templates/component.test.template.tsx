import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

describe('{{COMPONENT_NAME}} Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<{{COMPONENT_NAME}}>Test Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Test Content');
      expect(component).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<{{COMPONENT_NAME}}>Test Children</{{COMPONENT_NAME}}>);
      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<{{COMPONENT_NAME}} className="custom-class">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('custom-class');
    });

    it('forwards additional props', () => {
      render(
        <{{COMPONENT_NAME}} data-testid="custom-component" aria-label="Custom">
          Content
        </{{COMPONENT_NAME}}>
      );
      const component = screen.getByTestId('custom-component');
      expect(component).toHaveAttribute('aria-label', 'Custom');
    });
  });

  describe('Variants', () => {
    it('applies default variant styles', () => {
      render(<{{COMPONENT_NAME}} variant="default">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('bg-background', 'text-foreground');
    });

    it('applies primary variant styles', () => {
      render(<{{COMPONENT_NAME}} variant="primary">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('applies secondary variant styles', () => {
      render(<{{COMPONENT_NAME}} variant="secondary">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<{{COMPONENT_NAME}} size="sm">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('text-sm', 'p-sm');
    });

    it('applies medium size styles', () => {
      render(<{{COMPONENT_NAME}} size="md">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('text-base', 'p-md');
    });

    it('applies large size styles', () => {
      render(<{{COMPONENT_NAME}} size="lg">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('text-lg', 'p-lg');
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      render(<{{COMPONENT_NAME}} disabled>Disabled Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Disabled Content');
      expect(component).toHaveClass('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      expect(component).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<{{COMPONENT_NAME}} aria-label="Accessible component">Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Content');
      expect(component).toHaveAttribute('aria-label', 'Accessible component');
    });

    it('maintains focus visibility styles', () => {
      render(<{{COMPONENT_NAME}}>Focus Content</{{COMPONENT_NAME}}>);
      const component = screen.getByText('Focus Content');
      expect(component).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });
});
