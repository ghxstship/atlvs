import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, User, Clock, Search, Filter, BookOpen, TrendingUp } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Blog | GHXSTSHIP Resources',
  description: 'Stay updated with the latest insights, tutorials, and industry trends from GHXSTSHIP. Expert content on project management, creative workflows, and business growth.',
  openGraph: {
    title: 'Blog | GHXSTSHIP Resources',
    description: 'Stay updated with the latest insights, tutorials, and industry trends from GHXSTSHIP. Expert content on project management, creative workflows, and business growth.',
    url: 'https://ghxstship.com/resources/blog',
  },
};

const featuredPost = {
  title: 'The Future of Remote Creative Collaboration',
  excerpt: 'How distributed teams are reshaping the creative industry and what it means for your projects.',
  author: 'Sarah Chen',
  date: '2024-01-15',
  readTime: '8 min read',
  category: 'Industry Insights',
  image: '/api/placeholder/600/300',
  featured: true,
};

const blogPosts = [
  {
    title: 'Scaling Creative Teams: Lessons from 100+ Agencies',
    excerpt: 'Key strategies and common pitfalls when growing creative organizations.',
    author: 'Marcus Rodriguez',
    date: '2024-01-12',
    readTime: '6 min read',
    category: 'Business Growth',
    image: '/api/placeholder/400/200',
  },
  {
    title: 'AI in Creative Workflows: Enhancing Human Creativity',
    excerpt: 'How artificial intelligence is augmenting rather than replacing creative professionals.',
    author: 'Dr. Emily Watson',
    date: '2024-01-10',
    readTime: '5 min read',
    category: 'Technology',
    image: '/api/placeholder/400/200',
  },
  {
    title: 'Project Management Best Practices for Film Production',
    excerpt: 'Essential frameworks and tools for managing complex film and TV projects.',
    author: 'David Kim',
    date: '2024-01-08',
    readTime: '7 min read',
    category: 'Film & TV',
    image: '/api/placeholder/400/200',
  },
  {
    title: 'Building Global Creative Networks: A Complete Guide',
    excerpt: 'How to find, vet, and manage international creative talent effectively.',
    author: 'Lisa Park',
    date: '2024-01-05',
    readTime: '9 min read',
    category: 'Talent Management',
    image: '/api/placeholder/400/200',
  },
  {
    title: 'ROI Measurement in Creative Campaigns',
    excerpt: 'Metrics and methodologies for proving creative value to stakeholders.',
    author: 'James Wilson',
    date: '2024-01-03',
    readTime: '6 min read',
    category: 'Analytics',
    image: '/api/placeholder/400/200',
  },
  {
    title: 'The Rise of Hybrid Events: Production Insights',
    excerpt: 'Navigating the complexities of simultaneous in-person and virtual events.',
    author: 'Maria Gonzalez',
    date: '2024-01-01',
    readTime: '8 min read',
    category: 'Events',
    image: '/api/placeholder/400/200',
  },
];

const categories = [
  'All Posts',
  'Industry Insights',
  'Business Growth',
  'Technology',
  'Film & TV',
  'Talent Management',
  'Analytics',
  'Events',
  'Tutorials',
  'Case Studies',
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              GHXSTSHIP Blog
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              INSIGHTS &
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                INSPIRATION
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Stay ahead of the curve with expert insights, industry trends, and practical 
              guidance from the GHXSTSHIP team and creative community leaders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>500+</div>
                <div className="text-sm text-muted-foreground">Articles Published</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>50K+</div>
                <div className="text-sm text-muted-foreground">Monthly Readers</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>25+</div>
                <div className="text-sm text-muted-foreground">Expert Contributors</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>Weekly</div>
                <div className="text-sm text-muted-foreground">New Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Featured Article</h2>
          </div>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="aspect-video lg:aspect-auto bg-muted flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge variant="outline" className="mb-4 w-fit">
                  {featuredPost.category}
                </Badge>
                <h3 className={`${anton.className} text-2xl lg:text-3xl font-bold mb-4 uppercase`}>
                  {featuredPost.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredPost.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </div>
                </div>

                <Button className="w-fit group">
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All Posts' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Latest Articles</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3 text-xs">
                    {post.category}
                  </Badge>
                  <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase group-hover:text-primary transition-colors`}>
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="p-0 h-auto font-medium group">
                    Read More
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              NEVER MISS AN UPDATE
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get the latest insights, tutorials, and industry trends delivered 
              straight to your inbox every week.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="group">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              EXPLORE MORE RESOURCES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Dive deeper into specific topics with our comprehensive resource library.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Case Studies', href: '/resources/case-studies', icon: TrendingUp, description: 'Real-world success stories' },
              { title: 'Guides', href: '/resources/guides', icon: BookOpen, description: 'Step-by-step tutorials' },
              { title: 'Documentation', href: '/resources/docs', icon: BookOpen, description: 'Technical references' },
              { title: 'Whitepapers', href: '/resources/whitepapers', icon: BookOpen, description: 'In-depth research' },
            ].map((resource) => {
              const Icon = resource.icon;
              return (
                <Link key={resource.title} href={resource.href}>
                  <Card className="hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase group-hover:text-primary transition-colors`}>
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
