import type { Metadata } from 'next';
import { anton } from '../../../_components/lib/typography';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Clock, Eye, Lock, User } from 'lucide-react';
import { MarketingSection } from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Blog | GHXSTSHIP Resources',
  description: 'Industry insights, best practices, and behind-the-scenes stories from managing live entertainment productions. Learn from real-world experience.',
  openGraph: {
    title: 'Blog | GHXSTSHIP Resources',
    description: 'Industry insights, best practices, and behind-the-scenes stories from managing live entertainment productions.',
    url: 'https://ghxstship.com/resources/blog'
  }
};

const blogPosts = [
  {
    id: 'formula-1-lessons',
    title: 'What Formula 1 Taught Me About Production Management',
    excerpt: 'Managing 1,000+ hospitality staff at a $500M event teaches you things no MBA program ever could. Here\'s what I learned.',
    author: 'Julian Clarkson',
    date: '2024-12-15',
    readTime: '8 min read',
    category: 'Case Study',
    isPremium: true,
    views: '2.1k',
    image: '/api/placeholder/400/250'
  },
  {
    id: 'festival-chaos-management',
    title: 'Surviving Festival Chaos: A Production Manager\'s Guide',
    excerpt: 'From EDC Orlando to Miami Music Week, here\'s how to keep your sanity when managing 400K+ attendees and everything\'s on fire.',
    author: 'Julian Clarkson',
    date: '2024-12-10',
    readTime: '12 min read',
    category: 'Best Practices',
    isPremium: false,
    views: '3.5k',
    image: '/api/placeholder/400/250'
  },
  {
    id: 'cruise-ship-casting',
    title: 'How I Reduced Talent Casting from 6 Weeks to 5 Minutes',
    excerpt: 'The automation revolution that transformed Carnival Cruise Line\'s talent acquisition and what it means for the industry.',
    author: 'Julian Clarkson',
    date: '2024-12-05',
    readTime: '10 min read',
    category: 'Innovation',
    isPremium: true,
    views: '1.8k',
    image: '/api/placeholder/400/250'
  },
  {
    id: 'safety-first-always',
    title: 'Zero Safety Incidents: How We Do It',
    excerpt: 'Safety isn\'t negotiable in live entertainment. Here\'s our proven framework for maintaining perfect safety records.',
    author: 'Julian Clarkson',
    date: '2024-11-28',
    readTime: '6 min read',
    category: 'Safety',
    isPremium: false,
    views: '4.2k',
    image: '/api/placeholder/400/250'
  },
  {
    id: 'budget-management-reality',
    title: 'Managing $15M+ Budgets Without Losing Your Mind',
    excerpt: 'Real talk about production budgets, cost overruns, and the spreadsheets that haunt your dreams.',
    author: 'Julian Clarkson',
    date: '2024-11-20',
    readTime: '9 min read',
    category: 'Finance',
    isPremium: true,
    views: '2.7k',
    image: '/api/placeholder/400/250'
  },
  {
    id: 'vendor-relationships',
    title: 'Building Vendor Relationships That Actually Work',
    excerpt: 'After 13+ years in the industry, here\'s what I\'ve learned about working with suppliers, contractors, and everyone in between.',
    author: 'Julian Clarkson',
    date: '2024-11-15',
    readTime: '7 min read',
    category: 'Relationships',
    isPremium: false,
    views: '1.9k',
    image: '/api/placeholder/400/250'
  },
];

const categories = ['All', 'Case Study', 'Best Practices', 'Innovation', 'Safety', 'Finance', 'Relationships'];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <MarketingSection className=" bg-gradient-subtle" padding="lg">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Blog
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              INSIGHTS FROM
              <br />
              <span className="text-gradient-accent">
                THE TRENCHES
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Real stories, hard-won lessons, and practical insights from managing 
              everything from cruise ship entertainment to Formula 1 hospitality. 
              No fluff, just what actually works when the pressure's on.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Unlock Premium Content
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="#posts">
                <Button variant="outline">
                  Browse Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Category Filter */}
      <MarketingSection className="py-xl border-b" padding="md">
        <div className="container mx-auto px-md">
          <div className="flex flex-wrap justify-center gap-sm">
            {categories.map((category: any) => (
              <Badge 
                key={category} 
                variant={category === 'All' ? 'default' : 'outline'} 
                className="cursor-pointer transition-colors hover:bg-foreground/5 hover:text-accent px-md py-sm"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </MarketingSection>

      {/* Blog Posts */}
      <MarketingSection id="posts"  padding="md">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-xl">
            {blogPosts.map((post: any) => (
              <Card key={post.id} className="hover:shadow-elevation-3 transition-all duration-normal group overflow-hidden">
                <div className="relative">
                  <div className="h-container-xs bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-icon-2xl w-icon-2xl text-foreground mx-auto mb-sm" />
                      <p className="text-body-sm color-muted">Preview Image</p>
                    </div>
                  </div>
                  {post.isPremium && (
                    <div className="absolute top-md right-4">
                      <Badge className="bg-warning color-warning-foreground">
                        <Lock className="h-3 w-3 mr-xs" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-lg">
                  <h3 className={`mb-sm group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {post.title}
                  </h3>
                  <p className="color-muted mb-md line-clamp-xs">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-body-sm color-muted mb-md">
                    <div className="flex items-center gap-md">
                      <div className="flex items-center gap-xs">
                        <User className="h-icon-xs w-icon-xs" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-icon-xs w-icon-xs" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-xs">
                      <Eye className="h-icon-xs w-icon-xs" />
                      {post.views}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-xs text-body-sm color-muted">
                      <Clock className="h-icon-xs w-icon-xs" />
                      {post.readTime}
                    </div>
                    <Button 
                      variant={post.isPremium ? "default" : "outline"} 
                      size="sm" 
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      {post.isPremium ? 'Unlock' : 'Read'}
                      <ArrowRight className="ml-xs h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-2xl">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </MarketingSection>

      {/* Newsletter CTA */}
      <MarketingSection className=" bg-secondary/20" padding="md">
        <div className="container mx-auto px-md">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-xl">
              <h2 className={`mb-md ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                NEVER MISS AN UPDATE
              </h2>
              <p className="color-muted mb-lg">
                Get the latest insights, case studies, and industry updates delivered to your inbox. 
                No spam, just the good stuff from someone who's actually been there.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button className="group">
                    Subscribe to Blog
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MarketingSection>
    </div>
  );
}
