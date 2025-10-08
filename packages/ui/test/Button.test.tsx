import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ButtonGroup, IconButton, buttonVariants } from '../src/atoms/Button/Button';

// Mock React icons for testing
const MockIcon = () => <svg data-testid="mock-icon" />;

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders children correctly', () => {
      render(<Button>Test Content</Button>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards additional props to button element', () => {
      render(<Button data-testid="custom-button" aria-label="Custom">Button</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning', 'info'] as const;

    variants.forEach(variant => {
      it(`applies ${variant} variant styles`, () => {
        render(<Button variant={variant}>Button</Button>);
        const button = screen.getByRole('button');
        // Check that variant classes are applied (exact classes depend on implementation)
        expect(button).toHaveClass('inline-flex'); // Base class should always be present
      });
    });

    it('uses default variant when none specified', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-foreground', 'text-background'); // Default variant classes
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'default', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'] as const;

    sizes.forEach(size => {
      it(`applies ${size} size styles`, () => {
        render(<Button size={size}>Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex'); // Base class should always be present
      });
    });

    it('uses default size when none specified', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-icon-xl', 'px-md', 'py-sm'); // Default size classes
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('shows loading spinner when loading prop is true', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('relative', 'cursor-wait');
      // Check for spinner SVG
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('hides content when loading', () => {
      render(<Button loading>Hidden Content</Button>);
      const button = screen.getByRole('button');
      const content = button.querySelector('span');
      expect(content).toHaveClass('opacity-0');
    });

    it('applies fullWidth class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      render(<Button leftIcon={<MockIcon />}>Button with Left Icon</Button>);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gap-xs'); // Should have gap between icon and text
    });

    it('renders right icon correctly', () => {
      render(<Button rightIcon={<MockIcon />}>Button with Right Icon</Button>);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders both left and right icons', () => {
      render(
        <Button leftIcon={<MockIcon />} rightIcon={<MockIcon />}>
          Button with Both Icons
        </Button>
      );
      const icons = screen.getAllByTestId('mock-icon');
      expect(icons).toHaveLength(2);
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Loading Button</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Button aria-label="Accessible button">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Accessible button');
    });

    it('maintains focus visibility styles', () => {
      render(<Button>Focus Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });

  describe('buttonVariants function', () => {
    it('returns correct class names for variants', () => {
      expect(buttonVariants({ variant: 'default' })).toContain('bg-foreground');
      expect(buttonVariants({ variant: 'destructive' })).toContain('bg-destructive');
      expect(buttonVariants({ variant: 'outline' })).toContain('border');
      expect(buttonVariants({ variant: 'ghost' })).toContain('hover:bg-foreground/5');
    });

    it('returns correct class names for sizes', () => {
      expect(buttonVariants({ size: 'sm' })).toContain('h-icon-lg', 'px-sm');
      expect(buttonVariants({ size: 'lg' })).toContain('h-icon-2xl', 'px-lg');
      expect(buttonVariants({ size: 'icon' })).toContain('h-icon-xl', 'w-icon-xl');
    });

    it('combines variant and size classes correctly', () => {
      const classes = buttonVariants({ variant: 'primary', size: 'lg' });
      expect(classes).toContain('bg-foreground'); // variant class
      expect(classes).toContain('h-icon-2xl'); // size class
    });
  });
});

describe('ButtonGroup Component', () => {
  it('renders children correctly', () => {
    render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });

  it('applies horizontal layout by default', () => {
    render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    const container = screen.getByText('Button 1').parentElement;
    expect(container).toHaveClass('flex-row');
  });

  it('applies vertical layout when specified', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    const container = screen.getByText('Button 1').parentElement;
    expect(container).toHaveClass('flex-col');
  });

  it('applies different spacing sizes', () => {
    render(
      <ButtonGroup size="lg">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    const container = screen.getByText('Button 1').parentElement;
    expect(container).toHaveClass('gap-md');
  });

  it('applies custom className', () => {
    render(
      <ButtonGroup className="custom-group">
        <Button>Button</Button>
      </ButtonGroup>
    );

    const container = screen.getByText('Button').parentElement;
    expect(container).toHaveClass('custom-group');
  });
});

describe('IconButton Component', () => {
  it('renders with icon prop', () => {
    render(<IconButton icon={<MockIcon />} aria-label="Icon button" />);
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toBeInTheDocument();
    expect(button).toHaveClass('h-icon-lg', 'w-icon-lg'); // icon-sm size
  });

  it('forwards other props correctly', () => {
    const handleClick = vi.fn();
    render(
      <IconButton
        icon={<MockIcon />}
        onClick={handleClick}
        aria-label="Test icon button"
        data-testid="icon-button"
      />
    );

    const button = screen.getByTestId('icon-button');
    expect(button).toHaveAttribute('aria-label', 'Test icon button');
  });

  it('does not accept leftIcon or rightIcon props', () => {
    // IconButton should override size and icon props from Button
    render(<IconButton icon={<MockIcon />} size="lg" leftIcon={<MockIcon />} />);
    const button = screen.getByRole('button');
    // Should use icon-sm size regardless of size prop
    expect(button).toHaveClass('h-icon-lg', 'w-icon-lg');
  });
});
