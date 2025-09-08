import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, BookOpen, FileText, Video, Download, Search, Filter, Calendar, User, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resources - Learn, Grow, and Succeed | GHXSTSHIP',
  description: 'Access our comprehensive library of resources including blog posts, case studies, guides, documentation, and whitepapers.',
  openGraph: {
    title: 'Resources - Learn, Grow, and Succeed | GHXSTSHIP',
    description: 'Access our comprehensive library of resources including blog posts, case studies, guides, documentation, and whitepapers.',
    url: 'https://ghxstship.com/resources',
  },
};

const resourceCategories = [
  {
    id: 'blog',
    title: 'Blog',
    description: 'Latest insights, trends, and best practices',
    icon: BookOpen,
    count: '150+',
    gradient: 'from-blue-500 to-cyan-500',
    href: '/resources/blog',
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    description: 'Real-world success stories and implementations',
    icon: FileText,
    count: '45+',
    gradient: 'from-green-500 to-teal-500',
    href: '/resources/case-studies',
  },
  {
    id: 'guides',
    title: 'Guides',
    description: 'Step-by-step tutorials and how-to guides',
    icon: BookOpen,
    count: '75+',
    gradient: 'from-purple-500 to-pink-500',
    href: '/resources/guides',
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Complete technical documentation and API reference',
    icon: FileText,
    count: '200+',
    gradient: 'from-orange-500 to-red-500',
    href: '/resources/docs',
  },
  {
    id: 'whitepapers',
    title: 'Whitepapers',
    description: 'In-depth research and industry analysis',
    icon: Download,
    count: '25+',
    gradient: 'from-indigo-500 to-blue-500',
    href: '/resources/whitepapers',
  },
  {
    id: 'webinars',
    title: 'Webinars',
    description: 'Live and recorded educational sessions',
    icon: Video,
    count: '60+',
    gradient: 'from-red-500 to-pink-500',
    href: '/resources/webinars',
  },
];

const featuredContent = [
  {
    type: 'Blog Post',
    title: 'The Future of Production Management in 2026',
    description: 'Explore emerging trends and technologies that will shape the creative industry in the coming years.',
    author: 'Sarah Chen',
    date: 'Dec 10, 2024',
    readTime: '8 min read',
    category: 'Industry Insights',
    href: '/resources/blog/future-production-management-2026',
    featured: true,
  },
  {
    type: 'Case Study',
    title: 'How Meridian Studios Reduced Production Time by 45%',
    description: 'A detailed look at how ATLVS transformed Meridian Studios\' production workflow.',
    author: 'Marcus Rodriguez',
    date: 'Dec 8, 2024',
    readTime: '12 min read',
    category: 'Success Stories',
    href: '/resources/case-studies/meridian-studios-success',
    featured: true,
  },
  {
    type: 'Guide',
    title: 'Complete Guide to Setting Up Your First Project',
    description: 'Everything you need to know to get started with ATLVS project management.',
    author: 'Emily Watson',
    date: 'Dec 5, 2024',
    readTime: '15 min read',
    category: 'Getting Started',
    href: '/resources/guides/first-project-setup',
    featured: false,
  },
  {
    type: 'Whitepaper',
    title: 'The ROI of Modern Production Management Tools',
    description: 'Research-backed analysis of productivity gains and cost savings.',
    author: 'David Kim',
    date: 'Dec 3, 2024',
    readTime: '20 min read',
    category: 'Research',
    href: '/resources/whitepapers/roi-production-management',
    featured: false,
  },
  {
    type: 'Webinar',
    title: 'Mastering Team Collaboration in Remote Productions',
    description: 'Best practices for managing distributed creative teams effectively.',
    author: 'Lisa Thompson',
    date: 'Dec 1, 2024',
    readTime: '45 min watch',
    category: 'Education',
    href: '/resources/webinars/remote-team-collaboration',
    featured: false,
  },
  {
    type: 'Blog Post',
    title: 'AI-Powered Insights: The Game Changer for Creative Teams',
    description: 'How artificial intelligence is revolutionizing production management.',
    author: 'Alex Rivera',
    date: 'Nov 28, 2024',
    readTime: '10 min read',
    category: 'Technology',
    href: '/resources/blog/ai-powered-insights',
    featured: false,
  },
];

const popularTopics = [
  'Project Management',
  'Team Collaboration',
  'Production Workflows',
  'Creative Operations',
  'Industry Trends',
  'Best Practices',
  'Case Studies',
  'Getting Started',
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Resources
            </Badge>
            <h1 className="font-title text-4xl lg:text-6xl font-bold mb-6">
              LEARN, GROW,
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AND SUCCEED
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Access our comprehensive library of resources designed to help you master 
              production management and stay ahead of industry trends.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources, guides, case studies..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="flex flex-wrap justify-center gap-2">
              {popularTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              EXPLORE BY CATEGORY
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Find exactly what you're looking for with our organized resource categories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${category.gradient} mb-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-title text-xl font-bold mb-3">{category.title}</h3>
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                    <div className="text-sm font-semibold text-primary mb-6">
                      {category.count} resources
                    </div>
                    <Link href={category.href}>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Explore {category.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="font-title text-3xl lg:text-4xl font-bold mb-4">
                FEATURED CONTENT
              </h2>
              <p className="text-lg text-muted-foreground">
                Hand-picked resources to help you get the most out of GHXSTSHIP.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Sort by Date
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Featured Articles */}
            {featuredContent.filter(item => item.featured).map((item) => (
              <Card key={item.href} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">
                      {item.type}
                    </Badge>
                    <div className="font-title text-lg font-bold text-foreground">
                      Featured Content
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{item.readTime}</span>
                  </div>
                  <h3 className="font-title text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{item.author}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                    <Link href={item.href}>
                      <Button variant="ghost" size="sm" className="group">
                        Read More
                        <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Content Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredContent.filter(item => !item.featured).map((item) => (
              <Card key={item.href} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>{item.author}</span>
                    <span>{item.readTime}</span>
                  </div>
                  <Link href={item.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/resources/all">
              <Button variant="outline" size="lg">
                View All Resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              QUICK ACCESS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Jump directly to the most popular resources and tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'API Documentation', description: 'Complete API reference and examples', href: '/resources/api', icon: FileText },
              { title: 'Getting Started Guide', description: 'Step-by-step setup instructions', href: '/resources/getting-started', icon: BookOpen },
              { title: 'Video Tutorials', description: 'Learn with our video library', href: '/resources/tutorials', icon: Video },
              { title: 'Community Forum', description: 'Get help from the community', href: '/community/forums', icon: ExternalLink },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Card key={link.href} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-3">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                    <Link href={link.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        Access Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-8">
              <h3 className="font-title text-2xl font-bold mb-4">
                STAY UPDATED
              </h3>
              <p className="text-muted-foreground mb-6">
                Get the latest resources, insights, and updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <Button className="sm:w-auto">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                No spam, unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
