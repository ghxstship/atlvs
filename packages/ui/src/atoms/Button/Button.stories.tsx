import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Download, Plus, Send, Settings, Trash2 } from 'lucide-react';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Buttons trigger actions and events. They are one of the most commonly used UI elements and support various states, sizes, and variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outline', 'link'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button - default action
 */
export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

/**
 * Destructive button - for dangerous actions
 */
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

/**
 * Outline button - secondary emphasis
 */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

/**
 * Secondary button - less prominent
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

/**
 * Ghost button - minimal styling
 */
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

/**
 * Link button - text-like appearance
 */
export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};


/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

/**
 * Button with left icon
 */
export const WithLeftIcon: Story = {
  args: {
    children: 'Download',
    icon: Download,
  },
};

/**
 * Button with right icon
 */
export const WithRightIcon: Story = {
  args: {
    children: 'Send',
    iconRight: Send,
  },
};

/**
 * Button with both icons
 */
export const WithBothIcons: Story = {
  args: {
    children: 'Settings',
    icon: Settings,
    iconRight: Plus,
  },
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-md">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-md items-center">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

/**
 * Button group example
 */
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-sm">
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Save</Button>
    </div>
  ),
};

/**
 * Common use cases
 */
export const CommonUseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-lg max-w-md">
      <div className="flex gap-sm">
        <Button variant="destructive" icon={Trash2}>
          Delete
        </Button>
        <Button variant="outline">Cancel</Button>
      </div>
      
      <Button variant="primary" icon={Plus} fullWidth>
        Create New Project
      </Button>
      
      <Button variant="primary" iconRight={Send}>
        Submit Form
      </Button>
      
      <Button variant="outline" icon={Download}>
        Download Report
      </Button>
    </div>
  ),
};
