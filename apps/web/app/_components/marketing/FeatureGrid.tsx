'use client';

import { Award, BarChart3, Calendar, Clock, FileText, Globe, MessageSquare, Settings, Shield, Smartphone, Users, Zap } from 'lucide-react';
import { MarketingSection, MarketingSectionHeader, MarketingCard } from './layout/Section';

type AccentTone = 'primary' | 'success' | 'warning';

const featureCards: Array<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  category: string;
  highlight?: string;
  accent: AccentTone;
}> = [
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Predict outcomes, prioritize work, and surface blockers with real-time machine learning.',
    category: 'Intelligence',
    highlight: 'AI-Powered',
    accent: 'warning'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II controls, encryption at rest, and advanced role-based permissions.',
    category: 'Security',
    accent: 'success'
  },
  {
    icon: Globe,
    title: 'Global Collaboration',
    description: 'Coordinate studios worldwide with localized interfaces and synchronous reviews.',
    category: 'Collaboration',
    accent: 'primary'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Visualize financials, capacity, and throughput with adaptive dashboards.',
    category: 'Analytics',
    accent: 'warning'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Automate onboarding, track performance, and celebrate milestones effortlessly.',
    category: 'Management',
    accent: 'primary'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Resolve conflicts instantly and keep every department marching in lockstep.',
    category: 'Planning',
    accent: 'warning'
  },
  {
    icon: MessageSquare,
    title: 'Real-time Communication',
    description: 'Spin up collaborative rooms with annotations, approvals, and async summaries.',
    category: 'Communication',
    accent: 'primary'
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Secure versioning, approvals, and distribution with complete audit trails.',
    category: 'Documents',
    accent: 'success'
  },
  {
    icon: Settings,
    title: 'Custom Workflows',
    description: 'Drag-and-drop builder for bespoke pipelines, automations, and SLA trackers.',
    category: 'Automation',
    accent: 'primary'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Native iOS and Android experiences with offline sync and push approvals.',
    category: 'Mobile',
    accent: 'success'
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Auto-generate timesheets from activity data and integrate with billing.',
    category: 'Productivity',
    accent: 'warning'
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Embed review gates, QC checklists, and corrective workflows into every handoff.',
    category: 'Quality',
    accent: 'success'
  },
];

const highlightCards: Array<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  bullets: Array<{ label: string; tone: AccentTone | 'accent' }>;
  accent: AccentTone;
}> = [
  {
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Hardened infrastructure, 24/7 SOC, and white-glove onboarding for studios of any scale.',
    bullets: [
      { label: 'SOC 2 Type II Certified', tone: 'success' },
      { label: '99.9% Uptime SLA', tone: 'success' },
      { label: '24/7 Expert Support', tone: 'accent' },
    ],
    accent: 'success'
  },
  {
    icon: Zap,
    title: 'AI-Powered',
    description: 'Autonomous monitoring that predicts risk, optimizes capacity, and keeps schedules honest.',
    bullets: [
      { label: 'Predictive Analytics', tone: 'warning' },
      { label: 'Smart Recommendations', tone: 'warning' },
      { label: 'Automated Workflows', tone: 'accent' },
    ],
    accent: 'warning'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Run a single, consistent pipeline across continents with localized experiences.',
    bullets: [
      { label: '50+ Countries', tone: 'accent' },
      { label: 'Multi-language Support', tone: 'accent' },
      { label: 'Global CDN', tone: 'primary' },
    ],
    accent: 'primary'
  },
];

export function FeatureGrid() {
  return (
    <MarketingSection padding="lg">
      <div className="stack-5xl">
        <MarketingSectionHeader
          eyebrow="Platform Features"
          title="EVERYTHING YOU NEED IN ONE PLATFORM"
          highlight="IN ONE PLATFORM"
          description="From kickoff to delivery, GHXSTSHIP unifies creative, production, and operations teams on a single, adaptive workflow."
          align="center"
        />

        <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureCards.map(({ icon: Icon, title, description, category, highlight, accent }) => (
            <MarketingCard
              key={title}
              title={title}
              description={description}
              icon={<Icon className="h-icon-lg w-icon-lg" />}
              accent={accent}
              highlight={highlight}
              eyebrow={category}
              footer={<span className="marketing-microcopy">{category}</span>}
              className="items-start"
            />
          ))}
        </div>

        <div className="grid gap-lg lg:grid-cols-3">
          {highlightCards.map(({ icon: Icon, title, description, bullets, accent }) => (
            <MarketingCard
              key={title}
              title={title}
              description={description}
              icon={<Icon className="h-icon-lg w-icon-lg" />}
              accent={accent}
              className="items-start text-left"
              footer={
                <div className="stack-sm text-body-sm">
                  {bullets.map(({ label, tone }) => (
                    <div key={label} className="flex items-center gap-sm">
                      <span
                        className={
                          tone === 'success'
                            ? 'h-2 w-2 rounded-full bg-success'
                            : tone === 'warning'
                            ? 'h-2 w-2 rounded-full bg-warning'
                            : 'h-2 w-2 rounded-full bg-accent'
                        }
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              }
            />
          ))}
        </div>
      </div>
    </MarketingSection>
  );
}
