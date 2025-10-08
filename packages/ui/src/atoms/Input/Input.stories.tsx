import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Search, Lock, User } from 'lucide-react';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input fields allow users to enter text data. They support various types, states, and can include icons for enhanced usability.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    error: {
      control: 'boolean',
      description: 'Error state',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text input
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

/**
 * Email input
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
  },
};

/**
 * Password input
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

/**
 * Search input
 */
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

/**
 * Number input
 */
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
};

/**
 * Error state
 */
export const Error: Story = {
  args: {
    placeholder: 'Input with error',
    error: true,
    value: 'Invalid value',
  },
};

/**
 * With label
 */
export const WithLabel: Story = {
  render: () => (
    <div className="w-80">
      <label className="block text-sm font-medium mb-xs">
        Email Address
      </label>
      <Input type="email" placeholder="you@example.com" />
    </div>
  ),
};

/**
 * With helper text
 */
export const WithHelperText: Story = {
  render: () => (
    <div className="w-80">
      <label className="block text-sm font-medium mb-xs">
        Username
      </label>
      <Input placeholder="Enter username" />
      <p className="text-xs text-muted-foreground mt-xs">
        Must be at least 3 characters long
      </p>
    </div>
  ),
};

/**
 * With error message
 */
export const WithErrorMessage: Story = {
  render: () => (
    <div className="w-80">
      <label className="block text-sm font-medium mb-xs">
        Email
      </label>
      <Input type="email" error placeholder="you@example.com" value="invalid-email" />
      <p className="text-xs text-destructive mt-xs">
        Please enter a valid email address
      </p>
    </div>
  ),
};

/**
 * Form example
 */
export const FormExample: Story = {
  render: () => (
    <div className="w-96 space-y-md">
      <div>
        <label className="block text-sm font-medium mb-xs">
          <User className="inline h-4 w-4 mr-xs" />
          Full Name
        </label>
        <Input placeholder="John Doe" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-xs">
          <Mail className="inline h-4 w-4 mr-xs" />
          Email
        </label>
        <Input type="email" placeholder="john@example.com" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-xs">
          <Lock className="inline h-4 w-4 mr-xs" />
          Password
        </label>
        <Input type="password" placeholder="••••••••" />
        <p className="text-xs text-muted-foreground mt-xs">
          Must be at least 8 characters
        </p>
      </div>
    </div>
  ),
};

/**
 * Search bar example
 */
export const SearchBar: Story = {
  render: () => (
    <div className="w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search..." 
          className="pl-10"
        />
      </div>
    </div>
  ),
};

/**
 * All states showcase
 */
export const AllStates: Story = {
  render: () => (
    <div className="w-96 space-y-md">
      <div>
        <p className="text-sm font-medium mb-xs">Default</p>
        <Input placeholder="Default input" />
      </div>
      
      <div>
        <p className="text-sm font-medium mb-xs">Filled</p>
        <Input value="Filled input" />
      </div>
      
      <div>
        <p className="text-sm font-medium mb-xs">Disabled</p>
        <Input placeholder="Disabled" disabled />
      </div>
      
      <div>
        <p className="text-sm font-medium mb-xs">Error</p>
        <Input placeholder="Error state" error />
      </div>
    </div>
  ),
};
