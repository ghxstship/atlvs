import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Users, BarChart3, Shield, CheckCircle, Play, Zap, Clock, FileText, Settings, MessageSquare } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'ATLVS - Production Management That Actually Works | GHXSTSHIP',
  description: 'Stop drowning in spreadsheets and Slack chaos. ATLVS helps you manage productions like a pro without the mental breakdown.',
  openGraph: {
    title: 'ATLVS - Production Management That Actually Works | GHXSTSHIP',
    description: 'Stop drowning in spreadsheets and Slack chaos. ATLVS helps you manage productions like a pro without the mental breakdown.',
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
    quote: "ATLVS saved my sanity on our last production. Finally, a tool that actually helps instead of creating more work.",
    author: "Sarah Chen",
    role: "VP of Production, Meridian Studios",
    project: "The Last Frontier",
  },
  {
    quote: "No more chasing people down for updates or wondering if we're on budget. ATLVS just works, which is honestly refreshing.",
    author: "Marcus Rodriguez",
    role: "Creative Director, Apex Advertising",
    project: "Global Brand Campaign",
  },
];

export default function ATLVSPage() {
  return (
    <div className="min-h-screen brand-atlvs">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Production Management
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    ATLVS
                  </span>
                  <br />
                  PROJECT MANAGEMENT
                  <br />
                  THAT DOESN'T SUCK
                </h1>
                <p className="text-heading-4 color-muted">
                  Finally, production management built by someone who's actually managed real productions. 
                  Track budgets, wrangle crews, and hit deadlines without losing your mind.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>75K+</div>
                  <div className="text-body-sm color-muted">Projects Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>12K+</div>
                  <div className="text-body-sm color-muted">Active Teams</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>40%</div>
                  <div className="text-body-sm color-muted">Time Saved</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>98%</div>
                  <div className="text-body-sm color-muted">Satisfaction</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Free Trial
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-sm h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-popover overflow-hidden">
                <div className="flex items-center gap-sm px-md py-sm bg-secondary/50 border-b">
                  <div className="flex gap-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-sm  px-md py-xs bg-background rounded-md text-body-sm color-muted">
                      <div className="w-3 h-3 color-success">🔒</div>
                      atlvs.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>BLACKWATER REVERB</h3>
                      <p className="text-body-sm color-muted">Main Deck Takeover</p>
                    </div>
                    <Badge variant="outline" className="color-success border-success">
                      On Track
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Budget</div>
                      <div>$75K</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-accent h-1 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Timeline</div>
                      <div>85%</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-secondary h-1 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Team</div>
                      <div>12</div>
                      <div className="flex -cluster-xs mt-sm">
                        {[1, 2, 3].map((i: any) => (
                          <div key={i} className="w-4 h-4 bg-accent rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Recent Activity</div>
                    {[
                      { user: 'Captain Blackwater', action: 'approved budget revision', time: '2m ago' },
                      { user: 'First Mate Torres', action: 'updated crew schedule', time: '5m ago' },
                      { user: 'Quartermaster Jin', action: 'ordered new equipment', time: '12m ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="form-label">{activity.user}</span>
                        <span className="color-muted">{activity.action}</span>
                        <span className="color-muted ml-auto">{activity.time}</span>
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
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              FEATURES THAT ACTUALLY HELP
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              All the tools you need to manage productions without juggling 47 different apps. 
              Built from 13+ years of real-world production experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {features.map((feature: any) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-secondary mb-md">
                      <Icon className="h-6 w-6 text-background" />
                    </div>
                    <h3 className="text-heading-4 color-foreground mb-sm">{feature.title}</h3>
                    <p className="text-body-sm color-muted mb-md">{feature.description}</p>
                    <div className="stack-xs">
                      {feature.benefits.map((benefit: any) => (
                        <div key={benefit} className="flex items-center gap-sm">
                          <CheckCircle className="h-3 w-3 color-success flex-shrink-0" />
                          <span className="text-body-sm color-muted">{benefit}</span>
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
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              WORKS FOR REAL PRODUCTIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Whether you're managing a 50-person festival crew or a 5-person corporate shoot, 
              ATLVS scales without breaking (unlike your sanity with other tools).
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl">
            {useCases.map((useCase: any) => (
              <Card key={useCase.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-md uppercase`}>{useCase.title}</h3>
                  <p className="color-muted mb-lg">{useCase.description}</p>
                  
                  <div className="grid grid-cols-3 gap-md pt-lg border-t">
                    <div className="text-center">
                      <div className={`${anton.className} text-body text-heading-3 text-foreground uppercase`}>{useCase.stats.projects}</div>
                      <div className="text-body-sm color-muted">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className={`${anton.className} text-body text-heading-3 color-success uppercase`}>{useCase.stats.savings}</div>
                      <div className="text-body-sm color-muted">Time Saved</div>
                    </div>
                    <div className="text-center">
                      <div className={`${anton.className} text-body text-heading-3 color-secondary uppercase`}>{useCase.stats.satisfaction}</div>
                      <div className="text-body-sm color-muted">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              LOVED BY PRODUCTION PROS
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-xl max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <blockquote className="text-body color-foreground mb-lg leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-background text-heading-4 text-body-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-heading-4 color-foreground">{testimonial.author}</div>
                      <div className="text-body-sm color-muted">{testimonial.role}</div>
                      <div className="text-body-sm color-muted">Project: {testimonial.project}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO STOP THE CHAOS?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join 12K+ production teams who ditched spreadsheet hell for something that actually works. 
              Your crew will thank you (and so will your stress levels).
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center mb-xl">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-lg text-body-sm color-muted">
              <div className="flex items-center gap-sm">
                <CheckCircle className="h-4 w-4 color-success" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-sm">
                <Zap className="h-4 w-4 text-foreground" />
                <span>Setup in minutes</span>
              </div>
              <div className="flex items-center gap-sm">
                <Shield className="h-4 w-4 text-foreground" />
                <span>Enterprise security</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
