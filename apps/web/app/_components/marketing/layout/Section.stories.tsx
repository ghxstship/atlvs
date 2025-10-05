import type { Meta, StoryObj } from '@storybook/react';
import { MarketingSection } from './Section';
import { MarketingSectionHeader } from './Section';
import { MarketingCard } from './Section';

const meta: Meta = {
  title: 'Marketing/Layout Components',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Core marketing layout components for consistent page structure and visual hierarchy.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const MarketingSectionStory: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background">
      <MarketingSection variant="light" padding="lg">
        <MarketingSectionHeader
          title="Sample Section"
          description="This is a sample marketing section demonstrating the layout component."
          align="center"
        />
        <div className="text-center text-muted-foreground">
          Section content goes here
        </div>
      </MarketingSection>
    </div>
  ),
  name: 'Marketing Section',
  parameters: {
    docs: {
      description: {
        story: 'Basic marketing section with header and content area.',
      },
    },
  },
};

export const MarketingCardStory: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MarketingCard
          title="Sample Card"
          description="This card demonstrates the marketing card component with hover effects and proper spacing."
          icon={<div className="h-6 w-6 bg-primary rounded" />}
        />
        <MarketingCard
          title="Another Card"
          description="Cards can include various content and maintain consistent visual hierarchy."
          icon={<div className="h-6 w-6 bg-accent rounded" />}
        />
        <MarketingCard
          title="Third Card"
          description="Multiple cards create engaging grid layouts for marketing content."
          icon={<div className="h-6 w-6 bg-success rounded" />}
        />
      </div>
    </div>
  ),
  name: 'Marketing Cards',
  parameters: {
    docs: {
      description: {
        story: 'Grid of marketing cards demonstrating hover animations and responsive layout.',
      },
    },
  },
};

export const SectionVariants: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background space-y-8 p-8">
      <MarketingSection variant="light" padding="md">
        <MarketingSectionHeader
          title="Light Variant"
          description="Clean, minimal background for subtle content sections."
          align="left"
        />
      </MarketingSection>

      <MarketingSection variant="muted" padding="md">
        <MarketingSectionHeader
          title="Muted Variant"
          description="Subtle background for secondary content sections."
          align="center"
        />
      </MarketingSection>

      <MarketingSection variant="card" padding="md">
        <MarketingSectionHeader
          title="Card Variant"
          description="Elevated card-style sections for featured content."
          align="center"
        />
      </MarketingSection>

      <MarketingSection variant="elevated" padding="md">
        <MarketingSectionHeader
          title="Elevated Variant"
          description="Highly elevated sections for call-to-action content."
          align="center"
        />
      </MarketingSection>
    </div>
  ),
  name: 'Section Variants',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all available section variants for different content hierarchy levels.',
      },
    },
  },
};

export const ResponsiveBehavior: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Responsive Marketing Section"
          description="This section demonstrates responsive behavior across different screen sizes. Resize your browser to see the layout adapt."
          align="center"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
          {Array.from({ length: 4 }, (_, i) => (
            <MarketingCard
              key={i}
              title={`Feature ${i + 1}`}
              description={`Description for feature ${i + 1}. This demonstrates responsive card layouts.`}
              icon={<div className="h-6 w-6 bg-primary rounded" />}
            />
          ))}
        </div>
      </MarketingSection>
    </div>
  ),
  name: 'Responsive Behavior',
  parameters: {
    docs: {
      description: {
        story: 'Shows how marketing components adapt to different screen sizes and devices.',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
