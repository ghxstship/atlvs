import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, FileText, BookOpen, Download, Users, TrendingUp, Zap } from 'lucide-react';
import { typography } from '../lib/typography';

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
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Case Studies',
    description: 'Real-world success stories and lessons learned from managing everything from EDC festivals to Formula 1 events.',
    icon: TrendingUp,
    href: '/resources/case-studies',
    count: '12 Studies',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Guides',
    description: 'Step-by-step guides to mastering production management, from crew coordination to budget tracking.',
    icon: BookOpen,
    href: '/resources/guides',
    count: '18 Guides',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Documentation',
    description: 'Complete technical documentation, API references, and integration guides for GHXSTSHIP platform.',
    icon: Users,
    href: '/resources/documentation',
    count: 'Full Docs',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Whitepapers',
    description: 'In-depth research and analysis on industry trends, workflow optimization, and production innovation.',
    icon: Download,
    href: '/resources/whitepapers',
    count: '8 Papers',
    color: 'from-red-500 to-red-600',
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
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Knowledge Hub
            </Badge>
            <h1 className={`mb-6 ${typography.heroTitle}`}>
              RESOURCES FOR
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                PRODUCTION
              </span>
              <br />
              PROFESSIONALS
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Learn from real-world experience managing everything from cruise ship entertainment 
              to Formula 1 events. Get the insights, tools, and strategies that actually work 
              when the pressure's on and everyone's watching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Get Full Access
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#featured">
                <Button variant="outline">
                  Browse Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`mb-6 ${typography.sectionTitle}`}>
              EXPLORE BY CATEGORY
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Find exactly what you need to level up your production management game.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} href={category.href as any}>
                  <Card className="hover:shadow-lg transition-all duration-300 group h-full">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`group-hover:text-primary transition-colors ${typography.cardTitle}`}>
                          {category.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Explore {category.title}
                        <ArrowRight className="ml-1 h-4 w-4" />
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
      <section id="featured" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`mb-6 ${typography.sectionTitle}`}>
              FEATURED RESOURCES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Hand-picked content from our most popular and impactful resources.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{resource.category}</Badge>
                    <Badge variant={resource.type === 'Premium' ? 'default' : 'secondary'}>
                      {resource.type}
                    </Badge>
                  </div>
                  <h3 className={`mb-3 group-hover:text-primary transition-colors ${typography.cardTitle}`}>
                    {resource.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {resource.readTime}
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      {resource.type === 'Premium' ? 'Unlock' : 'Read'}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-12">
              <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className={`mb-6 ${typography.sectionTitle}`}>
                UNLOCK ALL RESOURCES
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get unlimited access to our complete library of case studies, guides, whitepapers, 
                and exclusive content. Learn from real-world experience managing million-dollar productions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • Full access for 14 days
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
