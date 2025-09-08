import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, BookOpen, Clock, User, Star, Filter, Search, Play, Download } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Guides | GHXSTSHIP Resources',
  description: 'Step-by-step guides and tutorials for mastering GHXSTSHIP. Learn best practices, workflows, and advanced techniques.',
  openGraph: {
    title: 'Guides | GHXSTSHIP Resources',
    description: 'Step-by-step guides and tutorials for mastering GHXSTSHIP. Learn best practices, workflows, and advanced techniques.',
    url: 'https://ghxstship.com/resources/guides',
  },
};

const featuredGuide = {
  title: 'Complete Guide to Project Management with GHXSTSHIP',
  description: 'Master project management from setup to delivery with our comprehensive guide covering workflows, team coordination, and best practices.',
  author: 'GHXSTSHIP Team',
  readTime: '25 min read',
  difficulty: 'Intermediate',
  category: 'Project Management',
  chapters: 8,
  featured: true,
};

const guides = [
  {
    title: 'Setting Up Your First Creative Project',
    description: 'Learn how to create, configure, and launch your first project on GHXSTSHIP.',
    author: 'Sarah Chen',
    readTime: '12 min read',
    difficulty: 'Beginner',
    category: 'Getting Started',
    rating: 4.9,
    views: '15.2K',
  },
  {
    title: 'Advanced Team Collaboration Strategies',
    description: 'Optimize team workflows and communication for complex creative projects.',
    author: 'Marcus Rodriguez',
    readTime: '18 min read',
    difficulty: 'Advanced',
    category: 'Team Management',
    rating: 4.8,
    views: '12.4K',
  },
  {
    title: 'Integrating GHXSTSHIP with Adobe Creative Suite',
    description: 'Seamlessly connect your Adobe workflows with GHXSTSHIP project management.',
    author: 'Emily Watson',
    readTime: '15 min read',
    difficulty: 'Intermediate',
    category: 'Integrations',
    rating: 4.7,
    views: '11.8K',
  },
  {
    title: 'Building Efficient Creative Workflows',
    description: 'Design and implement workflows that scale with your creative operations.',
    author: 'David Kim',
    readTime: '20 min read',
    difficulty: 'Intermediate',
    category: 'Workflows',
    rating: 4.9,
    views: '10.5K',
  },
  {
    title: 'Managing Global Creative Teams',
    description: 'Best practices for coordinating distributed creative teams across time zones.',
    author: 'Lisa Park',
    readTime: '16 min read',
    difficulty: 'Advanced',
    category: 'Team Management',
    rating: 4.6,
    views: '9.3K',
  },
  {
    title: 'API Integration for Developers',
    description: 'Complete guide to integrating GHXSTSHIP APIs into your applications.',
    author: 'James Wilson',
    readTime: '30 min read',
    difficulty: 'Advanced',
    category: 'Development',
    rating: 4.8,
    views: '8.7K',
  },
  {
    title: 'Optimizing Project Performance',
    description: 'Tips and techniques for maximizing project efficiency and delivery speed.',
    author: 'Maria Gonzalez',
    readTime: '14 min read',
    difficulty: 'Intermediate',
    category: 'Optimization',
    rating: 4.7,
    views: '8.1K',
  },
  {
    title: 'Security Best Practices',
    description: 'Implement enterprise-grade security measures for your creative projects.',
    author: 'Robert Chen',
    readTime: '22 min read',
    difficulty: 'Advanced',
    category: 'Security',
    rating: 4.9,
    views: '7.9K',
  },
  {
    title: 'Client Collaboration and Feedback',
    description: 'Streamline client communication and feedback collection processes.',
    author: 'Anna Thompson',
    readTime: '13 min read',
    difficulty: 'Beginner',
    category: 'Client Management',
    rating: 4.6,
    views: '7.2K',
  },
];

const categories = [
  'All Guides',
  'Getting Started',
  'Project Management',
  'Team Management',
  'Workflows',
  'Integrations',
  'Development',
  'Optimization',
  'Security',
  'Client Management',
];

const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500/5 via-background to-cyan-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Learning Resources
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              STEP-BY-STEP
              <br />
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                GUIDES
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Master GHXSTSHIP with our comprehensive guides and tutorials. 
              From beginner basics to advanced techniques, learn at your own pace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search guides..."
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
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>100+</div>
                <div className="text-sm text-muted-foreground">Guides Available</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>500K+</div>
                <div className="text-sm text-muted-foreground">Guide Views</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>4.8</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-2xl font-bold text-foreground mb-2 uppercase`}>Weekly</div>
                <div className="text-sm text-muted-foreground">New Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guide */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Featured Guide</h2>
          </div>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-teal-500" />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge variant="outline" className="mb-4 w-fit">
                  {featuredGuide.category}
                </Badge>
                <h3 className={`${anton.className} text-2xl lg:text-3xl font-bold mb-4 uppercase`}>
                  {featuredGuide.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {featuredGuide.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {featuredGuide.author}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {featuredGuide.readTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {featuredGuide.chapters} Chapters
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    {featuredGuide.difficulty}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="group">
                    Start Reading
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="outline" className="group">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === 'All Guides' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Difficulty Level</h3>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={difficulty === 'All Levels' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>All Guides</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-teal-500" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {guide.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        guide.difficulty === 'Beginner' ? 'text-green-600 border-green-600' :
                        guide.difficulty === 'Intermediate' ? 'text-yellow-600 border-yellow-600' :
                        'text-red-600 border-red-600'
                      }`}
                    >
                      {guide.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase group-hover:text-primary transition-colors`}>
                    {guide.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                    {guide.description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {guide.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {guide.readTime}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{guide.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{guide.views} views</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 group">
                      Read Guide
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Guides
            </Button>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              LEARNING PATHS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Structured learning journeys to master specific aspects of GHXSTSHIP.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'GHXSTSHIP Fundamentals',
                description: 'Master the basics of project management and team collaboration',
                guides: 6,
                duration: '3 hours',
                level: 'Beginner',
                color: 'from-green-500 to-emerald-500',
              },
              {
                title: 'Advanced Workflows',
                description: 'Design and implement complex creative workflows',
                guides: 8,
                duration: '5 hours',
                level: 'Advanced',
                color: 'from-blue-500 to-indigo-500',
              },
              {
                title: 'Enterprise Integration',
                description: 'Integrate GHXSTSHIP with enterprise systems and tools',
                guides: 10,
                duration: '7 hours',
                level: 'Advanced',
                color: 'from-purple-500 to-pink-500',
              },
            ].map((path) => (
              <Card key={path.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${path.color} rounded-lg flex items-center justify-center mb-4`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className={`${anton.className} text-xl font-bold mb-3 uppercase`}>
                    {path.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {path.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Guides:</span>
                      <span className="font-medium ml-1">{path.guides}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium ml-1">{path.duration}</span>
                    </div>
                    <div className="col-span-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          path.level === 'Beginner' ? 'text-green-600 border-green-600' :
                          'text-red-600 border-red-600'
                        }`}
                      >
                        {path.level}
                      </Badge>
                    </div>
                  </div>

                  <Button className="w-full group">
                    Start Learning Path
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO LEARN?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your GHXSTSHIP journey today with our comprehensive guides 
              and hands-on tutorials.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse All Guides
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
              MORE LEARNING RESOURCES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Documentation', href: '/resources/docs', description: 'Technical references and API docs' },
              { title: 'Blog', href: '/resources/blog', description: 'Latest insights and tutorials' },
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
