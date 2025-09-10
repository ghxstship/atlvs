import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Users, BarChart3, Shield, CheckCircle, Play, Zap, Clock, FileText, Settings, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ATLVS - Production Management Platform | GHXSTSHIP',
  description: 'ATLVS is the complete enterprise production management suite with AI-powered insights, real-time collaboration, and comprehensive project oversight.',
  openGraph: {
    title: 'ATLVS - Production Management Platform | GHXSTSHIP',
    description: 'ATLVS is the complete enterprise production management suite with AI-powered insights, real-time collaboration, and comprehensive project oversight.',
    url: 'https://ghxstship.com/products/atlvs',
  },
};

const features = [
  {
    icon: Calendar,
    title: 'Project Management',
    description: 'End-to-end project lifecycle management with Gantt charts, milestones, dependencies, and automated scheduling.',
    benefits: ['Visual project timelines', 'Resource allocation', 'Dependency tracking', 'Milestone management'],
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time communication, file sharing, collaborative workspaces, and integrated video conferencing.',
    benefits: ['Real-time messaging', 'File version control', 'Collaborative editing', 'Video meetings'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'AI-powered insights, custom dashboards, predictive analytics, and comprehensive reporting tools.',
    benefits: ['Custom dashboards', 'Predictive insights', 'Performance metrics', 'Export capabilities'],
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliance, advanced permissions, audit trails, and enterprise-grade data protection.',
    benefits: ['SOC 2 certified', 'Role-based access', 'Audit logging', 'Data encryption'],
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Accurate time logging, automated timesheets, billing integration, and productivity analytics.',
    benefits: ['Automatic tracking', 'Billing integration', 'Productivity insights', 'Mobile time entry'],
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Version control, approval workflows, secure file sharing, and collaborative document editing.',
    benefits: ['Version history', 'Approval workflows', 'Secure sharing', 'Real-time editing'],
  },
  {
    icon: Settings,
    title: 'Custom Workflows',
    description: 'Build and automate processes tailored to your specific needs with our visual workflow builder.',
    benefits: ['Visual builder', 'Automation rules', 'Custom triggers', 'Integration hooks'],
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Centralized communication with threaded discussions, @mentions, and notification management.',
    benefits: ['Threaded discussions', 'Smart notifications', '@mention system', 'Communication history'],
  },
];

const useCases = [
  {
    title: 'Film & TV Production',
    description: 'Manage complex multi-location shoots, coordinate large crews, and track production schedules.',
    stats: { projects: '15K+', savings: '45%', satisfaction: '99%' },
  },
  {
    title: 'Advertising Campaigns',
    description: 'Streamline creative workflows, manage client approvals, and deliver campaigns on time.',
    stats: { projects: '25K+', savings: '35%', satisfaction: '97%' },
  },
  {
    title: 'Corporate Content',
    description: 'Coordinate internal communications, training materials, and brand content production.',
    stats: { projects: '35K+', savings: '50%', satisfaction: '98%' },
  },
];

const testimonials = [
  {
    quote: "ATLVS has completely transformed how we manage our productions. The visibility and control we now have is unprecedented.",
    author: "Sarah Chen",
    role: "VP of Production, Meridian Studios",
    project: "The Last Frontier",
  },
  {
    quote: "The real-time collaboration features have eliminated so many bottlenecks. Our team is more aligned than ever.",
    author: "Marcus Rodriguez",
    role: "Creative Director, Apex Advertising",
    project: "Global Brand Campaign",
  },
];

export default function ATLVSPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500/5 via-background to-cyan-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Production Management
                </Badge>
                <h1 className="font-title text-4xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    ATLVS
                  </span>
                  <br />
                  PRODUCTION MANAGEMENT
                  <br />
                  REIMAGINED
                </h1>
                <p className="text-xl text-muted-foreground">
                  The complete enterprise production management suite with AI-powered insights, 
                  real-time collaboration, and comprehensive project oversight.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className="font-title text-3xl font-bold text-foreground mb-2">75K+</div>
                  <div className="text-sm text-muted-foreground">Projects Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-title text-3xl font-bold text-foreground mb-2">12K+</div>
                  <div className="text-sm text-muted-foreground">Active Teams</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-title text-3xl font-bold text-foreground mb-2">40%</div>
                  <div className="text-sm text-muted-foreground">Time Saved</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-title text-3xl font-bold text-foreground mb-2">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button size="lg" className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-xs text-muted-foreground">
                      <div className="w-3 h-3 text-green-500">🔒</div>
                      atlvs.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-title text-lg font-bold">BLACKWATER REVERB</h3>
                      <p className="text-sm text-muted-foreground">Main Deck Takeover</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      On Track
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Budget</div>
                      <div className="font-semibold">$75K</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-blue-500 h-1 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                      <div className="font-semibold">85%</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-cyan-500 h-1 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Team</div>
                      <div className="font-semibold">12</div>
                      <div className="flex -space-x-1 mt-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-4 h-4 bg-blue-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Recent Activity</div>
                    {[
                      { user: 'Captain Blackwater', action: 'approved budget revision', time: '2m ago' },
                      { user: 'First Mate Torres', action: 'updated crew schedule', time: '5m ago' },
                      { user: 'Quartermaster Jin', action: 'ordered new equipment', time: '12m ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground">{activity.action}</span>
                        <span className="text-muted-foreground ml-auto">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              COMPREHENSIVE FEATURES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage complex productions from start to finish, 
              all in one integrated platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                    <div className="space-y-1">
                      {feature.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              BUILT FOR YOUR INDUSTRY
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ATLVS adapts to your specific industry needs with customizable workflows 
              and specialized features.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="font-title text-xl font-bold mb-4">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6">{useCase.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <div className="font-title text-lg font-bold text-blue-500">{useCase.stats.projects}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="font-title text-lg font-bold text-green-500">{useCase.stats.savings}</div>
                      <div className="text-xs text-muted-foreground">Time Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="font-title text-lg font-bold text-purple-500">{useCase.stats.satisfaction}</div>
                      <div className="text-xs text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              TRUSTED BY INDUSTRY LEADERS
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <blockquote className="text-lg text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">Project: {testimonial.project}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              READY TO TRANSFORM YOUR PRODUCTION?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of production teams who have revolutionized their workflows with ATLVS.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Setup in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Enterprise security</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
