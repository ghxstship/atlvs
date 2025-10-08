import type { Meta, StoryObj } from '@storybook/react';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

const meta = {
  title: '{{CATEGORY}}/{{COMPONENT_NAME}}',
  component: {{COMPONENT_NAME}},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '{{COMPONENT_DESCRIPTION}}',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary'],
      description: 'Component variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof {{COMPONENT_NAME}}>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default {{COMPONENT_NAME}} with standard styling
 */
export const Default: Story = {
  args: {
    children: '{{COMPONENT_NAME}} Content',
    variant: 'default',
    size: 'md',
  },
};

/**
 * Primary variant
 */
export const Primary: Story = {
  args: {
    ...Default.args,
    variant: 'primary',
  },
};

/**
 * Secondary variant
 */
export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: 'secondary',
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-md">
      <{{COMPONENT_NAME}} variant="default">Default</{{COMPONENT_NAME}}>
      <{{COMPONENT_NAME}} variant="primary">Primary</{{COMPONENT_NAME}}>
      <{{COMPONENT_NAME}} variant="secondary">Secondary</{{COMPONENT_NAME}}>
    </div>
  ),
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-md items-center">
      <{{COMPONENT_NAME}} size="sm">Small</{{COMPONENT_NAME}}>
      <{{COMPONENT_NAME}} size="md">Medium</{{COMPONENT_NAME}}>
      <{{COMPONENT_NAME}} size="lg">Large</{{COMPONENT_NAME}}>
    </div>
  ),
};
