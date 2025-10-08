import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badges are used to highlight an item\'s status, category, or other metadata. They provide contextual information at a glance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'success', 'error', 'warning', 'info'],
      description: 'Visual style variant of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge with standard styling
 */
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
};

/**
 * Secondary variant - used for less prominent information
 */
export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: 'secondary',
    children: 'Secondary',
  },
};

/**
 * Success variant - indicates positive status
 */
export const Success: Story = {
  args: {
    ...Default.args,
    variant: 'success',
    children: 'Success',
  },
};

/**
 * Error variant - indicates problems or failures
 */
export const Error: Story = {
  args: {
    ...Default.args,
    variant: 'error',
    children: 'Error',
  },
};

/**
 * Warning variant - indicates caution needed
 */
export const Warning: Story = {
  args: {
    ...Default.args,
    variant: 'warning',
    children: 'Warning',
  },
};

/**
 * Info variant - provides additional information
 */
export const Info: Story = {
  args: {
    ...Default.args,
    variant: 'info',
    children: 'Info',
  },
};

/**
 * Small size badge
 */
export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    children: 'Small',
  },
};

/**
 * Large size badge
 */
export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    children: 'Large',
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-md">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-md items-center">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

/**
 * Usage in context - status indicators
 */
export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <span className="text-sm">Server Status:</span>
        <Badge variant="success">Online</Badge>
      </div>
      <div className="flex items-center gap-sm">
        <span className="text-sm">Build Status:</span>
        <Badge variant="error">Failed</Badge>
      </div>
      <div className="flex items-center gap-sm">
        <span className="text-sm">Deployment:</span>
        <Badge variant="warning">In Progress</Badge>
      </div>
    </div>
  ),
};

/**
 * Usage in context - counts and metrics
 */
export const CountsAndMetrics: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <span className="text-sm">New Messages</span>
        <Badge variant="error">5</Badge>
      </div>
      <div className="flex items-center gap-sm">
        <span className="text-sm">Active Users</span>
        <Badge variant="success">1,234</Badge>
      </div>
      <div className="flex items-center gap-sm">
        <span className="text-sm">Pending Tasks</span>
        <Badge variant="info">12</Badge>
      </div>
    </div>
  ),
};
