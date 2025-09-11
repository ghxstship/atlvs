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
    gradient: 'from-primary to-accent',
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
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
            EVERYTHING YOU NEED
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IN ONE PLATFORM
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From project inception to final delivery, GHXSTSHIP provides all the tools 
            and features you need to manage complex productions efficiently.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {feature.category}
                  </Badge>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enterprise Ready */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-title text-xl font-bold mb-4">Enterprise Ready</h3>
              <p className="text-muted-foreground mb-6">
                Built for scale with enterprise-grade security, compliance, and support.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>24/7 Expert Support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered */}
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-title text-xl font-bold mb-4">AI-Powered</h3>
              <p className="text-muted-foreground mb-6">
                Intelligent automation and insights to optimize your workflows.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Predictive Analytics</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Smart Recommendations</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Automated Workflows</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Scale */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-title text-xl font-bold mb-4">Global Scale</h3>
              <p className="text-muted-foreground mb-6">
                Connect teams worldwide with multi-region infrastructure.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>50+ Countries</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Multi-language Support</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
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
