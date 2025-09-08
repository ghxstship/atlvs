import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Search, BookOpen, Code, Settings, Users, Zap, ExternalLink, Download } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Documentation | GHXSTSHIP Resources',
  description: 'Complete technical documentation for GHXSTSHIP platform. API references, integration guides, and developer resources.',
  openGraph: {
    title: 'Documentation | GHXSTSHIP Resources',
    description: 'Complete technical documentation for GHXSTSHIP platform. API references, integration guides, and developer resources.',
    url: 'https://ghxstship.com/resources/docs',
  },
};

const quickStart = [
  {
    title: 'Getting Started',
    description: 'Set up your GHXSTSHIP account and create your first project',
    icon: BookOpen,
    time: '5 min',
    href: '/docs/getting-started',
  },
  {
    title: 'API Integration',
    description: 'Connect your applications with GHXSTSHIP APIs',
    icon: Code,
    time: '15 min',
    href: '/docs/api-integration',
  },
  {
    title: 'Team Setup',
    description: 'Configure teams, roles, and permissions',
    icon: Users,
    time: '10 min',
    href: '/docs/team-setup',
  },
  {
    title: 'Project Configuration',
    description: 'Customize workflows and project settings',
    icon: Settings,
    time: '12 min',
    href: '/docs/project-config',
  },
];

const docSections = [
  {
    title: 'Platform Overview',
    description: 'Understand GHXSTSHIP core concepts and architecture',
    articles: [
      { title: 'Platform Introduction', href: '/docs/platform/intro' },
      { title: 'Core Concepts', href: '/docs/platform/concepts' },
      { title: 'Architecture Overview', href: '/docs/platform/architecture' },
      { title: 'Security & Compliance', href: '/docs/platform/security' },
    ],
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'API Reference',
    description: 'Complete REST API documentation with examples',
    articles: [
      { title: 'Authentication', href: '/docs/api/auth' },
      { title: 'Projects API', href: '/docs/api/projects' },
      { title: 'Teams API', href: '/docs/api/teams' },
      { title: 'Webhooks', href: '/docs/api/webhooks' },
    ],
    icon: Code,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Integrations',
    description: 'Connect with third-party tools and services',
    articles: [
      { title: 'Slack Integration', href: '/docs/integrations/slack' },
      { title: 'Adobe Creative Suite', href: '/docs/integrations/adobe' },
      { title: 'Google Workspace', href: '/docs/integrations/google' },
      { title: 'Custom Integrations', href: '/docs/integrations/custom' },
    ],
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'User Management',
    description: 'Manage users, teams, and access controls',
    articles: [
      { title: 'User Roles & Permissions', href: '/docs/users/roles' },
      { title: 'Team Management', href: '/docs/users/teams' },
      { title: 'SSO Configuration', href: '/docs/users/sso' },
      { title: 'User Onboarding', href: '/docs/users/onboarding' },
    ],
    icon: Users,
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'Project Management',
    description: 'Create and manage projects effectively',
    articles: [
      { title: 'Project Creation', href: '/docs/projects/creation' },
      { title: 'Workflow Configuration', href: '/docs/projects/workflows' },
      { title: 'Resource Management', href: '/docs/projects/resources' },
      { title: 'Reporting & Analytics', href: '/docs/projects/analytics' },
    ],
    icon: Settings,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Advanced Features',
    description: 'Leverage advanced platform capabilities',
    articles: [
      { title: 'Automation Rules', href: '/docs/advanced/automation' },
      { title: 'Custom Fields', href: '/docs/advanced/fields' },
      { title: 'Bulk Operations', href: '/docs/advanced/bulk' },
      { title: 'Data Export', href: '/docs/advanced/export' },
    ],
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
  },
];

const popularDocs = [
  { title: 'REST API Quick Start', views: '15.2K', href: '/docs/api/quickstart' },
  { title: 'Webhook Setup Guide', views: '12.8K', href: '/docs/api/webhooks-guide' },
  { title: 'Team Permissions Guide', views: '11.4K', href: '/docs/users/permissions-guide' },
  { title: 'Project Templates', views: '9.7K', href: '/docs/projects/templates' },
  { title: 'Slack Integration Setup', views: '8.9K', href: '/docs/integrations/slack-setup' },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Developer Resources
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              TECHNICAL
              <br />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                DOCUMENTATION
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Everything you need to integrate, customize, and extend the GHXSTSHIP platform. 
              Complete API references, guides, and examples for developers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button className="group">
                <Download className="mr-2 h-4 w-4" />
                Download SDK
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>200+</div>
                <div className="text-sm text-muted-foreground">API Endpoints</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>50+</div>
                <div className="text-sm text-muted-foreground">Integration Guides</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>99.9%</div>
                <div className="text-sm text-muted-foreground">API Uptime</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>24/7</div>
                <div className="text-sm text-muted-foreground">Developer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Quick Start Guides</h2>
            <p className="text-lg text-muted-foreground">
              Get up and running with GHXSTSHIP in minutes with our step-by-step guides.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStart.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link key={guide.title} href={guide.href}>
                  <Card className="hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase group-hover:text-primary transition-colors`}>
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {guide.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {guide.time}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Complete Documentation</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive guides and references for every aspect of the GHXSTSHIP platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`${anton.className} text-xl font-bold mb-3 uppercase`}>
                      {section.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {section.description}
                    </p>
                    
                    <div className="space-y-2">
                      {section.articles.map((article) => (
                        <Link key={article.title} href={article.href}>
                          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors group">
                            <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                              {article.title}
                            </span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Documentation */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Popular Documentation</h2>
              <p className="text-muted-foreground mb-8">
                Most viewed guides and references by the developer community.
              </p>
              
              <div className="space-y-4">
                {popularDocs.map((doc, index) => (
                  <Link key={doc.title} href={doc.href}>
                    <Card className="hover:shadow-lg transition-shadow group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{doc.views} views</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Developer Resources</h2>
              <div className="space-y-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase`}>API Status</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">All systems operational</span>
                    </div>
                    <Link href="/status">
                      <Button variant="outline" size="sm" className="group">
                        View Status Page
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase`}>SDKs & Libraries</h3>
                    <div className="space-y-2 mb-4">
                      {['JavaScript/TypeScript', 'Python', 'PHP', 'Ruby', 'Go'].map((sdk) => (
                        <div key={sdk} className="flex items-center gap-2">
                          <Code className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-foreground">{sdk}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="group">
                      <Download className="mr-2 h-3 w-3" />
                      Download SDKs
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase`}>Developer Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get help from our developer community and support team.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Community Forum
                      </Button>
                      <Button variant="outline" size="sm">
                        Discord
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              START BUILDING TODAY
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to integrate GHXSTSHIP into your application? Get started with our 
              comprehensive APIs and developer tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get API Keys
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Code className="mr-2 h-4 w-4" />
                View API Reference
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              MORE RESOURCES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Guides', href: '/resources/guides', description: 'Step-by-step tutorials' },
              { title: 'Blog', href: '/resources/blog', description: 'Latest insights and updates' },
              { title: 'Case Studies', href: '/resources/case-studies', description: 'Real-world success stories' },
            ].map((resource) => (
              <Link key={resource.title} href={resource.href}>
                <Card className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6 text-center">
                    <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase group-hover:text-primary transition-colors`}>
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
