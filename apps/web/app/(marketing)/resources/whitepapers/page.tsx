import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, FileText, Download, Calendar, User, Eye, Filter, Search, TrendingUp } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Whitepapers | GHXSTSHIP Resources',
  description: 'In-depth research and analysis on creative industry trends, best practices, and emerging technologies. Download comprehensive whitepapers from GHXSTSHIP.',
  openGraph: {
    title: 'Whitepapers | GHXSTSHIP Resources',
    description: 'In-depth research and analysis on creative industry trends, best practices, and emerging technologies. Download comprehensive whitepapers from GHXSTSHIP.',
    url: 'https://ghxstship.com/resources/whitepapers',
  },
};

const featuredWhitepaper = {
  title: 'The Future of Creative Collaboration: 2024 Industry Report',
  description: 'Comprehensive analysis of emerging trends, technologies, and methodologies reshaping creative collaboration across industries.',
  author: 'GHXSTSHIP Research Team',
  publishDate: '2024-01-15',
  pages: 45,
  downloads: '12.5K',
  category: 'Industry Research',
  featured: true,
};

const whitepapers = [
  {
    title: 'Remote Creative Teams: Performance & Productivity Study',
    description: 'Data-driven insights into remote creative team performance, productivity metrics, and optimization strategies.',
    author: 'Dr. Sarah Chen',
    publishDate: '2024-01-10',
    pages: 32,
    downloads: '8.7K',
    category: 'Team Management',
  },
  {
    title: 'AI in Creative Workflows: Adoption & Impact Analysis',
    description: 'Comprehensive study on AI integration in creative processes and its impact on productivity and quality.',
    author: 'Marcus Rodriguez',
    publishDate: '2024-01-05',
    pages: 28,
    downloads: '9.2K',
    category: 'Technology',
  },
  {
    title: 'Global Creative Talent Market: 2024 State of the Industry',
    description: 'Market analysis of global creative talent trends, compensation, and skill demand across regions.',
    author: 'Emily Watson',
    publishDate: '2023-12-20',
    pages: 38,
    downloads: '7.4K',
    category: 'Market Research',
  },
  {
    title: 'Enterprise Creative Operations: Scaling Best Practices',
    description: 'Strategic framework for scaling creative operations in enterprise environments.',
    author: 'David Kim',
    publishDate: '2023-12-15',
    pages: 42,
    downloads: '6.8K',
    category: 'Enterprise',
  },
  {
    title: 'Creative Project ROI: Measurement & Optimization',
    description: 'Methodologies for measuring and optimizing return on investment in creative projects.',
    author: 'Lisa Park',
    publishDate: '2023-12-10',
    pages: 35,
    downloads: '6.1K',
    category: 'Analytics',
  },
  {
    title: 'Sustainability in Creative Production: Green Practices Guide',
    description: 'Comprehensive guide to implementing sustainable practices in creative production workflows.',
    author: 'James Wilson',
    publishDate: '2023-12-05',
    pages: 29,
    downloads: '5.9K',
    category: 'Sustainability',
  },
  {
    title: 'Client Collaboration Evolution: Digital Transformation Impact',
    description: 'Analysis of how digital transformation has changed client-agency collaboration models.',
    author: 'Maria Gonzalez',
    publishDate: '2023-11-30',
    pages: 33,
    downloads: '5.5K',
    category: 'Client Relations',
  },
  {
    title: 'Creative Security: Protecting Intellectual Property in Digital Age',
    description: 'Security frameworks and best practices for protecting creative assets and intellectual property.',
    author: 'Robert Chen',
    publishDate: '2023-11-25',
    pages: 40,
    downloads: '5.2K',
    category: 'Security',
  },
  {
    title: 'Agile Creative Methodologies: Implementation & Results',
    description: 'Study on agile methodology adoption in creative teams and measurable outcomes.',
    author: 'Anna Thompson',
    publishDate: '2023-11-20',
    pages: 31,
    downloads: '4.8K',
    category: 'Methodologies',
  },
];

const categories = [
  'All Categories',
  'Industry Research',
  'Team Management',
  'Technology',
  'Market Research',
  'Enterprise',
  'Analytics',
  'Sustainability',
  'Client Relations',
  'Security',
  'Methodologies',
];

export default function WhitepapersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-500/5 via-background to-gray-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Research & Analysis
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              IN-DEPTH
              <br />
              <span className="bg-gradient-to-r from-slate-500 to-gray-500 bg-clip-text text-transparent">
                RESEARCH
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Access comprehensive research, industry analysis, and strategic insights 
              from GHXSTSHIP's team of experts and industry thought leaders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search whitepapers..."
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
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>50+</div>
                <div className="text-sm text-muted-foreground">Research Papers</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>100K+</div>
                <div className="text-sm text-muted-foreground">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>25+</div>
                <div className="text-sm text-muted-foreground">Expert Authors</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>Monthly</div>
                <div className="text-sm text-muted-foreground">New Research</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Whitepaper */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Featured Research</h2>
          </div>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-slate-500/10 to-gray-500/10 flex items-center justify-center">
                <FileText className="h-16 w-16 text-slate-500" />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge variant="outline" className="mb-4 w-fit">
                  {featuredWhitepaper.category}
                </Badge>
                <h3 className={`${anton.className} text-2xl lg:text-3xl font-bold mb-4 uppercase`}>
                  {featuredWhitepaper.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {featuredWhitepaper.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {featuredWhitepaper.author}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredWhitepaper.publishDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {featuredWhitepaper.pages} Pages
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {featuredWhitepaper.downloads} Downloads
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="group">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="group">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All Categories' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Whitepapers Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Research Library</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whitepapers.map((paper, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gradient-to-br from-slate-500/10 to-gray-500/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-500" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3 text-xs">
                    {paper.category}
                  </Badge>
                  
                  <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase group-hover:text-primary transition-colors`}>
                    {paper.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                    {paper.description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {paper.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(paper.publishDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {paper.pages} pages
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {paper.downloads}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 group">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Research
            </Button>
          </div>
        </div>
      </section>

      {/* Research Impact */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              RESEARCH IMPACT
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our research drives industry innovation and informs strategic decisions 
              across the creative sector.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { metric: '100K+', label: 'Total Downloads', description: 'Across all research papers' },
              { metric: '500+', label: 'Industry Citations', description: 'References in industry publications' },
              { metric: '50+', label: 'Research Papers', description: 'Published since 2020' },
              { metric: '25+', label: 'Expert Authors', description: 'Industry thought leaders' },
            ].map((stat) => (
              <Card key={stat.metric} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`${anton.className} text-4xl font-bold text-primary mb-2 uppercase`}>
                    {stat.metric}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{stat.label}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-slate-500/5 to-gray-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              STAY INFORMED
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get notified when new research is published. Join our research 
              community for exclusive insights and early access.
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
              Research updates only. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO APPLY INSIGHTS?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform research insights into actionable strategies with GHXSTSHIP. 
              Start implementing best practices today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Discuss Research
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              EXPLORE MORE RESOURCES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Case Studies', href: '/resources/case-studies', description: 'Real-world implementation stories' },
              { title: 'Blog', href: '/resources/blog', description: 'Latest insights and analysis' },
              { title: 'Guides', href: '/resources/guides', description: 'Practical implementation guides' },
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
