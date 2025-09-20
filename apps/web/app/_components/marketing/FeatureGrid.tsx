'use client';


import { Card, CardContent, Badge } from '@ghxstship/ui';
import { 
  Zap, 
  Shield, 
  Globe, 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings, 
  Smartphone,
  Clock,
  Award
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations and predictive analytics to optimize your production workflows.',
    category: 'Intelligence',
    gradient: 'from-warning to-destructive',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II certified with advanced encryption, SSO, and granular permissions.',
    category: 'Security',
    gradient: 'from-success to-accent',
  },
  {
    icon: Globe,
    title: 'Global Collaboration',
    description: 'Connect teams across time zones with real-time sync and multi-language support.',
    category: 'Collaboration',
    gradient: 'from-primary to-secondary',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and custom reports to track performance and ROI.',
    category: 'Analytics',
    gradient: 'from-secondary to-accent',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Streamlined onboarding, role-based access, and performance tracking.',
    category: 'Management',
    gradient: 'from-secondary to-primary',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Intelligent resource allocation and conflict resolution for optimal planning.',
    category: 'Planning',
    gradient: 'from-destructive to-accent',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Communication',
    description: 'Integrated chat, video calls, and collaborative workspaces.',
    category: 'Communication',
    gradient: 'from-accent to-success',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Version control, approval workflows, and secure file sharing.',
    category: 'Documents',
    gradient: 'from-warning to-destructive',
  },
  {
    icon: Settings,
    title: 'Custom Workflows',
    description: 'Build and automate processes tailored to your specific needs.',
    category: 'Automation',
    gradient: 'from-muted to-secondary',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Full-featured mobile apps for iOS and Android with offline capabilities.',
    category: 'Mobile',
    gradient: 'from-accent to-secondary',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Accurate time logging with automated timesheets and billing integration.',
    category: 'Productivity',
    gradient: 'from-warning to-accent',
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Built-in review processes and quality checkpoints throughout production.',
    category: 'Quality',
    gradient: 'from-success to-accent',
  },
];

const categories = [
  'All',
  'Intelligence',
  'Security',
  'Collaboration',
  'Analytics',
  'Management',
  'Planning',
];

export function FeatureGrid() {
  return (
    <section className="py-4xl bg-secondary/20">
      <div className="container mx-auto px-lg">
        {/* Section Header */}
        <div className="text-center mb-xl">
          <Badge variant="outline" className="mb-sm">
            Platform Features
          </Badge>
          <h1 className="text-heading-1">
            EVERYTHING YOU NEED
            <br />
            <span className="text-gradient-accent">
              IN ONE PLATFORM
            </span>
          </h1>
          <p className="text-body color-muted max-w-3xl mx-auto">
            From project inception to final delivery, GHXSTSHIP provides all the tools 
            and features you need to manage complex productions efficiently.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl mb-xl">
          {features.map((feature: any) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:shadow-floating transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-lg">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} mb-sm`}>
                    <Icon className="h-6 w-6 color-accent-foreground" />
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-sm text-body-sm">
                    {feature.category}
                  </Badge>

                  {/* Title */}
                  <h3 className="text-heading-3 text-foreground uppercase group-hover:color-accent transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-body-sm color-muted leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="grid lg:grid-cols-3 gap-xl">
          {/* Enterprise Ready */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-md">
                <Shield className="h-8 w-8 color-accent" />
              </div>
              <h3 className="text-heading-3 mb-sm">Enterprise Ready</h3>
              <p className="color-muted mb-md">
                Built for scale with enterprise-grade security, compliance, and support.
              </p>
              <div className="stack-xl text-body-sm">
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>24/7 Expert Support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered */}
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-md">
                <Zap className="h-8 w-8 color-accent" />
              </div>
              <h3 className="text-heading-3 mb-sm">AI-Powered</h3>
              <p className="color-muted mb-md">
                Intelligent automation and insights to optimize your workflows.
              </p>
              <div className="stack-xl text-body-sm">
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Predictive Analytics</span>
                </div>
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Smart Recommendations</span>
                </div>
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Automated Workflows</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Scale */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-md">
                <Globe className="h-8 w-8 color-accent" />
              </div>
              <h3 className="text-heading-3 mb-sm">Global Scale</h3>
              <p className="color-muted mb-md">
                Connect teams worldwide with multi-region infrastructure.
              </p>
              <div className="stack-xl text-body-sm">
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>50+ Countries</span>
                </div>
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Multi-language Support</span>
                </div>
                <div className="flex items-center justify-center gap-sm">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Global CDN</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
