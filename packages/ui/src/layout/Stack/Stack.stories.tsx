import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Stack is a layout component that arranges children vertically with consistent spacing. It provides a simple and flexible way to create vertical layouts with proper spacing and alignment.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'Space between items',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Alignment of items',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      description: 'Justification of content',
    },
    wrap: {
      control: 'boolean',
      description: 'Whether to wrap items',
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const BoxExample = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-md bg-primary/10 border border-primary/20 rounded-md ${className}`}>
    {children}
  </div>
);

/**
 * Default stack with medium spacing
 */
export const Default: Story = {
  args: {
    spacing: 'md',
    children: (
      <>
        <BoxExample>Item 1</BoxExample>
        <BoxExample>Item 2</BoxExample>
        <BoxExample>Item 3</BoxExample>
      </>
    ),
  },
};

/**
 * Stack with small spacing
 */
export const SmallSpacing: Story = {
  args: {
    spacing: 'sm',
    children: (
      <>
        <BoxExample>Item 1</BoxExample>
        <BoxExample>Item 2</BoxExample>
        <BoxExample>Item 3</BoxExample>
      </>
    ),
  },
};

/**
 * Stack with large spacing
 */
export const LargeSpacing: Story = {
  args: {
    spacing: 'lg',
    children: (
      <>
        <BoxExample>Item 1</BoxExample>
        <BoxExample>Item 2</BoxExample>
        <BoxExample>Item 3</BoxExample>
      </>
    ),
  },
};

/**
 * Center aligned items
 */
export const CenterAligned: Story = {
  args: {
    spacing: 'md',
    align: 'center',
    children: (
      <>
        <BoxExample className="w-32">Short</BoxExample>
        <BoxExample className="w-64">Medium Width</BoxExample>
        <BoxExample className="w-48">Varied</BoxExample>
      </>
    ),
  },
};

/**
 * End aligned items
 */
export const EndAligned: Story = {
  args: {
    spacing: 'md',
    align: 'end',
    children: (
      <>
        <BoxExample className="w-32">Short</BoxExample>
        <BoxExample className="w-64">Medium Width</BoxExample>
        <BoxExample className="w-48">Varied</BoxExample>
      </>
    ),
  },
};

/**
 * Stretch alignment (full width items)
 */
export const StretchAligned: Story = {
  args: {
    spacing: 'md',
    align: 'stretch',
    children: (
      <>
        <BoxExample>Full Width Item 1</BoxExample>
        <BoxExample>Full Width Item 2</BoxExample>
        <BoxExample>Full Width Item 3</BoxExample>
      </>
    ),
  },
};

/**
 * All spacing sizes showcase
 */
export const AllSpacings: Story = {
  render: () => (
    <div className="space-y-2xl">
      <div>
        <p className="text-sm font-semibold mb-sm">Extra Small (xs)</p>
        <Stack spacing="xs">
          <BoxExample>Item 1</BoxExample>
          <BoxExample>Item 2</BoxExample>
          <BoxExample>Item 3</BoxExample>
        </Stack>
      </div>
      <div>
        <p className="text-sm font-semibold mb-sm">Small (sm)</p>
        <Stack spacing="sm">
          <BoxExample>Item 1</BoxExample>
          <BoxExample>Item 2</BoxExample>
          <BoxExample>Item 3</BoxExample>
        </Stack>
      </div>
      <div>
        <p className="text-sm font-semibold mb-sm">Medium (md)</p>
        <Stack spacing="md">
          <BoxExample>Item 1</BoxExample>
          <BoxExample>Item 2</BoxExample>
          <BoxExample>Item 3</BoxExample>
        </Stack>
      </div>
      <div>
        <p className="text-sm font-semibold mb-sm">Large (lg)</p>
        <Stack spacing="lg">
          <BoxExample>Item 1</BoxExample>
          <BoxExample>Item 2</BoxExample>
          <BoxExample>Item 3</BoxExample>
        </Stack>
      </div>
    </div>
  ),
};

/**
 * Form layout example
 */
export const FormLayout: Story = {
  render: () => (
    <Stack spacing="md" className="max-w-md">
      <div>
        <label className="block text-sm font-medium mb-xs">Name</label>
        <input type="text" className="w-full p-sm border rounded-md" placeholder="Enter your name" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-xs">Email</label>
        <input type="email" className="w-full p-sm border rounded-md" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-xs">Message</label>
        <textarea className="w-full p-sm border rounded-md" rows={4} placeholder="Your message" />
      </div>
      <button className="bg-primary text-primary-foreground px-md py-sm rounded-md">
        Submit
      </button>
    </Stack>
  ),
};
