import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, FileText, Code, Zap, Lock, Search, BookOpen, ExternalLink } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';


export const metadata: Metadata = {
  title: 'Documentation | GHXSTSHIP Resources',
  description: 'Complete technical documentation, API references, and integration guides for GHXSTSHIP platform. Get up and running fast.',
  openGraph: {
    title: 'Documentation | GHXSTSHIP Resources',
    description: 'Complete technical documentation, API references, and integration guides for GHXSTSHIP platform.',
    url: 'https://ghxstship.com/resources/documentation',
  },
};

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guides to get you up and running with GHXSTSHIP in minutes, not hours.',
    icon: Zap,
    articles: 8,
    isPremium: false,
    topics: ['Account Setup', 'First Project', 'Team Invites', 'Basic Navigation'],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Complete REST API documentation with examples, authentication, and rate limiting details.',
    icon: Code,
    articles: 25,
    isPremium: true,
    topics: ['Authentication', 'Projects API', 'People API', 'Webhooks'],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect GHXSTSHIP with your existing tools and workflows using our integration guides.',
    icon: ExternalLink,
    articles: 12,
    isPremium: false,
    topics: ['Zapier', 'Slack', 'Google Workspace', 'Microsoft Teams'],
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Deep dives into advanced functionality for power users and enterprise deployments.',
    icon: BookOpen,
    articles: 15,
    isPremium: true,
    topics: ['Custom Workflows', 'Advanced Reporting', 'SSO Setup', 'Data Export'],
  },
];

const popularDocs = [
  {
    title: 'Quick Start Guide',
    description: 'Get your first project up and running in under 10 minutes',
    category: 'Getting Started',
    readTime: '5 min',
    isPremium: false,
    popularity: 'Most Popular',
  },
  {
    title: 'Projects API Documentation',
    description: 'Complete reference for managing projects programmatically',
    category: 'API Reference',
    readTime: '15 min',
    isPremium: true,
    popularity: 'Developer Favorite',
  },
  {
    title: 'Slack Integration Setup',
    description: 'Connect your team communications with production updates',
    category: 'Integrations',
    readTime: '8 min',
    isPremium: false,
    popularity: 'Team Essential',
  },
  {
    title: 'Custom Workflow Builder',
    description: 'Build workflows that match your unique production processes',
    category: 'Advanced Features',
    readTime: '20 min',
    isPremium: true,
    popularity: 'Power User',
  },
];

const quickLinks = [
  { title: 'API Status', href: '#', external: true },
  { title: 'Changelog', href: '#', external: false },
  { title: 'Rate Limits', href: '#', external: false },
  { title: 'SDKs & Libraries', href: '#', external: false },
  { title: 'Postman Collection', href: '#', external: true },
  { title: 'OpenAPI Spec', href: '#', external: true },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Documentation
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              TECHNICAL
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                DOCUMENTATION
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Everything you need to integrate, customize, and get the most out of GHXSTSHIP. 
              Built by developers who actually use this stuff in production environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Get API Access
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#sections">
                <Button variant="outline">
                  Browse Docs
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 color-muted" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-2xl pr-md py-md bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-xl border-b">
        <div className="container mx-auto px-md">
          <div className="flex flex-wrap justify-center gap-md">
            {quickLinks.map((link: any) => (
              <Link key={link.title} href="#">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:color-primary-foreground transition-colors px-md py-sm">
                  {link.title}
                  {link.external && <ExternalLink className="ml-xs h-3 w-3" />}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section id="sections" className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              DOCUMENTATION SECTIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Find exactly what you need, whether you're just getting started or building complex integrations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {docSections.map((section: any) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="hover:shadow-floating transition-all duration-300 group">
                  <CardContent className="p-xl">
                    <div className="flex items-start justify-between mb-lg">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-8 w-8 text-background" />
                      </div>
                      <div className="flex items-center gap-sm">
                        <Badge variant="secondary">{section.articles} articles</Badge>
                        {section.isPremium && (
                          <Badge className="bg-warning color-warning-foreground">
                            <Lock className="h-3 w-3 mr-xs" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className={`mb-sm group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                      {section.title}
                    </h3>
                    <p className="color-muted mb-lg">
                      {section.description}
                    </p>
                    
                    <div className="mb-lg">
                      <h4 className="text-body-sm text-heading-4 color-foreground mb-sm">Popular Topics:</h4>
                      <div className="flex flex-wrap gap-sm">
                        {section.topics.map((topic: any) => (
                          <Badge key={topic} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant={section.isPremium ? "default" : "outline"} 
                      className="w-full group-hover:translate-x-1 transition-transform"
                    >
                      {section.isPremium ? 'Unlock Section' : 'Browse Section'}
                      <ArrowRight className="ml-sm h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Documentation */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              POPULAR DOCUMENTATION
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              The most accessed and helpful documentation articles from our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-lg">
            {popularDocs.map((doc, index) => (
              <Card key={index} className="hover:shadow-floating transition-all duration-300 group">
                <CardContent className="p-lg">
                  <div className="flex items-center justify-between mb-md">
                    <Badge variant="outline">{doc.category}</Badge>
                    <div className="flex items-center gap-sm">
                      <Badge variant="outline">
                        {doc.popularity}
                      </Badge>
                      {doc.isPremium && (
                        <Badge className="bg-warning color-warning-foreground text-body-sm">
                          <Lock className="h-3 w-3 mr-xs" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className={`mb-sm group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {doc.title}
                  </h3>
                  <p className="color-muted mb-md">
                    {doc.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm color-muted">
                      {doc.readTime} read
                    </span>
                    <Button 
                      variant={doc.isPremium ? "default" : "outline"} 
                      size="sm" 
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      {doc.isPremium ? 'Unlock' : 'Read'}
                      <ArrowRight className="ml-xs h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              DEVELOPER RESOURCES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-xl">
            {[
              {
                title: 'API Explorer',
                description: 'Interactive API documentation with live examples and testing capabilities',
                icon: Code,
                isPremium: true,
              },
              {
                title: 'SDK Libraries',
                description: 'Official SDKs for JavaScript, Python, PHP, and more programming languages',
                icon: FileText,
                isPremium: false,
              },
              {
                title: 'Webhooks Guide',
                description: 'Real-time notifications and event-driven integrations with your applications',
                icon: Zap,
                isPremium: true,
              },
            ].map((resource, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow text-center">
                <CardContent className="p-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-md">
                    <resource.icon className="h-8 w-8 text-background" />
                  </div>
                  <h3 className={`mb-sm ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {resource.title}
                  </h3>
                  <p className="color-muted mb-lg">
                    {resource.description}
                  </p>
                  <Button 
                    variant={resource.isPremium ? "default" : "outline"} 
                    size="sm"
                  >
                    {resource.isPremium ? 'Get Access' : 'Explore'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-2xl">
              <Code className="h-16 w-16 text-foreground mx-auto mb-lg" />
              <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
                BUILD WITH GHXSTSHIP
              </h2>
              <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
                Get full access to our API documentation, SDKs, and developer resources. 
                Build integrations that work with real production management workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Get API Keys
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-body-sm color-muted mt-lg">
                Free tier available • No credit card required • Rate limits apply
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
