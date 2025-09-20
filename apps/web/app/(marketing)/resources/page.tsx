import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, FileText, BookOpen, Download, Users, TrendingUp, Zap } from 'lucide-react';
import { typography, anton } from '../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'Resources | GHXSTSHIP',
  description: 'Explore our comprehensive collection of resources including blog posts, case studies, guides, documentation, and whitepapers to master creative production management.',
  openGraph: {
    title: 'Resources | GHXSTSHIP',
    description: 'Explore our comprehensive collection of resources including blog posts, case studies, guides, documentation, and whitepapers to master creative production management.',
    url: 'https://ghxstship.com/resources',
  },
};

const resourceCategories = [
  {
    title: 'Blog',
    description: 'Industry insights, best practices, and behind-the-scenes stories from the trenches of live entertainment production.',
    icon: FileText,
    href: '/resources/blog',
    count: '25+ Articles',
    color: 'from-primary to-secondary',
  },
  {
    title: 'Case Studies',
    description: 'Real-world success stories and lessons learned from managing everything from EDC festivals to Formula 1 events.',
    icon: TrendingUp,
    href: '/resources/case-studies',
    count: '12 Studies',
    color: 'from-primary to-secondary',
  },
  {
    title: 'Guides',
    description: 'Step-by-step guides to mastering production management, from crew coordination to budget tracking.',
    icon: BookOpen,
    href: '/resources/guides',
    count: '18 Guides',
    color: 'from-primary to-secondary',
  },
  {
    title: 'Documentation',
    description: 'Complete technical documentation, API references, and integration guides for GHXSTSHIP platform.',
    icon: Users,
    href: '/resources/documentation',
    count: 'Full Docs',
    color: 'from-primary to-secondary',
  },
  {
    title: 'Whitepapers',
    description: 'In-depth research and analysis on industry trends, workflow optimization, and production innovation.',
    icon: Download,
    href: '/resources/whitepapers',
    count: '8 Papers',
    color: 'from-primary to-secondary',
  },
];

const featuredResources = [
  {
    category: 'Case Study',
    title: 'Managing 1,000+ Crew at Formula 1 Las Vegas',
    description: 'How we achieved zero safety incidents while coordinating hospitality operations for a $500M+ event.',
    readTime: '12 min read',
    type: 'Premium',
  },
  {
    category: 'Guide',
    title: 'Festival Production Management 101',
    description: 'Everything you need to know about managing large-scale festival operations, from planning to execution.',
    readTime: '8 min read',
    type: 'Free',
  },
  {
    category: 'Whitepaper',
    title: 'The Future of Live Entertainment Production',
    description: 'Industry analysis and predictions for how technology will reshape live entertainment over the next decade.',
    readTime: '15 min read',
    type: 'Premium',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Knowledge Hub
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              RESOURCES FOR
              <br />
              <span className="text-gradient-accent">
                PRODUCTION
              </span>
              <br />
              PROFESSIONALS
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Learn from real-world experience managing everything from cruise ship entertainment 
              to Formula 1 events. Get the insights, tools, and strategies that actually work 
              when the pressure's on and everyone's watching.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group transition-all duration-200 hover:scale-105">
                  Get Full Access
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#featured">
                <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                  Browse Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              EXPLORE BY CATEGORY
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Find exactly what you need to level up your production management game.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {resourceCategories.map((category: any) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} href="#">
                  <Card className="hover:shadow-floating transition-all duration-300 group h-full">
                    <CardContent className="p-xl">
                      <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-background" />
                      </div>
                      <div className="flex items-center justify-between mb-sm">
                        <h3 className={`group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                          {category.title}
                        </h3>
                        <Badge variant="outline">
                          {category.count}
                        </Badge>
                      </div>
                      <p className="color-muted mb-md">
                        {category.description}
                      </p>
                      <div className="flex items-center text-foreground text-body-sm form-label group-hover:translate-x-1 transition-transform">
                        Explore {category.title}
                        <ArrowRight className="ml-xs h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section id="featured" className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              FEATURED RESOURCES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Hand-picked content from our most popular and impactful resources.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl">
            {featuredResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow group">
                <CardContent className="p-lg">
                  <div className="flex items-center justify-between mb-md">
                    <Badge variant="outline">{resource.category}</Badge>
                    <Badge variant={resource.type === 'Premium' ? 'default' : 'secondary'}>
                      {resource.type}
                    </Badge>
                  </div>
                  <h3 className={`mb-sm group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {resource.title}
                  </h3>
                  <p className="color-muted mb-md">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm color-muted">
                      {resource.readTime}
                    </span>
                    <Button variant="ghost" size="sm" className="transition-all duration-200 group-hover:text-accent">
                      {resource.type === 'Premium' ? 'Unlock' : 'Read'}
                      <ArrowRight className="ml-xs h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
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
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-2xl">
              <Zap className="h-16 w-16 text-foreground mx-auto mb-lg" />
              <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
                UNLOCK ALL RESOURCES
              </h2>
              <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
                Get unlimited access to our complete library of case studies, guides, whitepapers, 
                and exclusive content. Learn from real-world experience managing million-dollar productions.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group transition-all duration-200 hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="transition-all duration-200 hover:scale-105">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-body-sm color-muted mt-lg">
                No credit card required • Full access for 14 days
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
