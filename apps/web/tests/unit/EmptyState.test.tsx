import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmptyState } from '@ghxstship/ui';
import { vi } from 'vitest';

// Mock fetch for demo loading
global.fetch = vi.fn();

describe('EmptyState Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description', () => {
    render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
      />
    );

    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first record')).toBeInTheDocument();
  });

  it('renders primary action button', () => {
    const mockOnClick = vi.fn();
    
    render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
        primaryAction={{
          label: 'Create New',
          onClick: mockOnClick
        }}
      />
    );

    const button = screen.getByText('Create New');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders demo action button and handles loading', async () => {
    const mockOnLoadDemo = vi.fn().mockResolvedValue(undefined);
    
    // Mock successful API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
        demoAction={{
          label: 'Load Demo',
          onLoadDemo: mockOnLoadDemo,
          organizationId: 'test-org-id'
        }}
      />
    );

    const demoButton = screen.getByText('Load Demo');
    expect(demoButton).toBeInTheDocument();
    
    fireEvent.click(demoButton);
    
    // Check loading state
    expect(screen.getByText('Loading Demo...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockOnLoadDemo).toHaveBeenCalledTimes(1);
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/demo/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: 'test-org-id' })
    });
  });

  it('handles demo loading error', async () => {
    const mockOnLoadDemo = vi.fn();
    
    // Mock failed API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to load demo data' })
    });

    render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
        demoAction={{
          label: 'Load Demo',
          onLoadDemo: mockOnLoadDemo,
          organizationId: 'test-org-id'
        }}
      />
    );

    const demoButton = screen.getByText('Load Demo');
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load demo data')).toBeInTheDocument();
    });

    expect(mockOnLoadDemo).not.toHaveBeenCalled();
  });

  it('renders custom icon', () => {
    const TestIcon = () => <div data-testid="custom-icon">Custom Icon</div>;
    
    render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
        icon={<TestIcon />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows demo description text', () => {
    render(
      <EmptyState
        title="No data found"
        description="Get started by creating your first record"
        demoAction={{
          label: 'Load Demo',
          onLoadDemo: vi.fn(),
          organizationId: 'test-org-id'
        }}
      />
    );

    expect(screen.getByText('Demo includes pirate-themed sample data for immediate exploration')).toBeInTheDocument();
  });
});
