import type { Meta, StoryObj } from '@storybook/react';
import { Rocket } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';

const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Cards are flexible containers for grouping related content. They support headers, bodies, and footers with consistent spacing and styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated'],
      description: 'Visual style variant',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with header and body
 */
export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-sm text-muted-foreground">Card description goes here</p>
      </CardHeader>
      <CardBody>
        <p>This is the main content of the card. It can contain any elements you need.</p>
      </CardBody>
    </Card>
  ),
};

/**
 * Card with header, body, and footer
 */
export const WithFooter: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Complete Card</h3>
        <p className="text-sm text-muted-foreground">With all sections</p>
      </CardHeader>
      <CardBody>
        <p>Card content with header and footer sections for complete layouts.</p>
      </CardBody>
      <CardFooter className="flex justify-end gap-sm">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Bordered variant
 */
export const Bordered: Story = {
  render: () => (
    <Card variant="bordered" className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Bordered Card</h3>
      </CardHeader>
      <CardBody>
        <p>This card has a visible border for emphasis.</p>
      </CardBody>
    </Card>
  ),
};

/**
 * Elevated variant with shadow
 */
export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Elevated Card</h3>
      </CardHeader>
      <CardBody>
        <p>This card has an elevated appearance with shadow.</p>
      </CardBody>
    </Card>
  ),
};

/**
 * Card with badge
 */
export const WithBadge: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Project Status</h3>
            <p className="text-sm text-muted-foreground">Q4 2025</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p>Project is on track and progressing well.</p>
      </CardBody>
    </Card>
  ),
};

/**
 * Stat card example
 */
export const StatCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardBody className="text-center">
        <p className="text-sm text-muted-foreground">Total Users</p>
        <p className="text-4xl font-bold mt-sm">1,234</p>
        <p className="text-sm text-success mt-xs">↑ 12% from last month</p>
      </CardBody>
    </Card>
  ),
};

/**
 * Feature card example
 */
export const FeatureCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-md">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Fast Performance</h3>
      </CardHeader>
      <CardBody>
        <p className="text-muted-foreground">
          Lightning-fast load times and optimized bundle sizes ensure your users have the best experience.
        </p>
      </CardBody>
      <CardFooter>
        <Button variant="link" className="px-0">
          Learn more →
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Product card example
 */
export const ProductCard: Story = {
  render: () => (
    <Card className="w-80">
      <div className="aspect-video bg-muted rounded-t-lg" />
      <CardBody>
        <div className="flex justify-between items-start mb-sm">
          <h3 className="text-lg font-semibold">Premium Plan</h3>
          <Badge>Popular</Badge>
        </div>
        <p className="text-muted-foreground mb-md">
          Everything you need for professional work.
        </p>
        <div className="flex items-baseline gap-xs mb-md">
          <span className="text-3xl font-bold">$29</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <Button fullWidth>Get Started</Button>
      </CardBody>
    </Card>
  ),
};

/**
 * Grid of cards
 */
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-md">
      <Card>
        <CardBody className="text-center">
          <p className="text-3xl font-bold">42</p>
          <p className="text-sm text-muted-foreground mt-xs">Projects</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <p className="text-3xl font-bold">1.2k</p>
          <p className="text-sm text-muted-foreground mt-xs">Users</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <p className="text-3xl font-bold">98%</p>
          <p className="text-sm text-muted-foreground mt-xs">Uptime</p>
        </CardBody>
      </Card>
    </div>
  ),
};

/**
 * Interactive card with hover
 */
export const Interactive: Story = {
  render: () => (
    <Card className="w-96 cursor-pointer transition-all hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">Interactive Card</h3>
        <p className="text-sm text-muted-foreground">Hover to see effect</p>
      </CardHeader>
      <CardBody>
        <p>This card responds to hover interactions with elevation changes.</p>
      </CardBody>
    </Card>
  ),
};
