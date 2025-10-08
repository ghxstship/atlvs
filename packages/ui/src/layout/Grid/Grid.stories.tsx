import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Grid provides a flexible CSS Grid layout with responsive columns, gaps, and alignment options.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const BoxExample = ({ children }: { children: React.ReactNode }) => (
  <div className="p-md bg-primary/10 border border-primary/20 rounded-md text-center">
    {children}
  </div>
);

export const TwoColumns: Story = {
  render: () => (
    <Grid cols={2} gap="md">
      <BoxExample>Item 1</BoxExample>
      <BoxExample>Item 2</BoxExample>
      <BoxExample>Item 3</BoxExample>
      <BoxExample>Item 4</BoxExample>
    </Grid>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3} gap="md">
      <BoxExample>1</BoxExample>
      <BoxExample>2</BoxExample>
      <BoxExample>3</BoxExample>
      <BoxExample>4</BoxExample>
      <BoxExample>5</BoxExample>
      <BoxExample>6</BoxExample>
    </Grid>
  ),
};

export const ResponsiveGrid: Story = {
  render: () => (
    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md">
      <BoxExample>Responsive 1</BoxExample>
      <BoxExample>Responsive 2</BoxExample>
      <BoxExample>Responsive 3</BoxExample>
    </Grid>
  ),
};
