import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, BookOpen, Clock, Users, Star, Lock, Eye, CheckCircle } from 'lucide-react';
import { typography } from '../../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'Guides | GHXSTSHIP Resources',
  description: 'Step-by-step guides to mastering production management, from crew coordination to budget tracking. Learn from 13+ years of industry experience.',
  openGraph: {
    title: 'Guides | GHXSTSHIP Resources',
    description: 'Step-by-step guides to mastering production management, from crew coordination to budget tracking.',
    url: 'https://ghxstship.com/resources/guides',
  },
};

const guides = [
  {
    id: 'festival-production-101',
    title: 'Festival Production Management 101',
    description: 'Everything you need to know about managing large-scale festival operations, from initial planning to post-event wrap-up.',
    difficulty: 'Beginner',
    duration: '45 min',
    chapters: 8,
    category: 'Festival Management',
    isPremium: false,
    rating: 4.9,
    completions: '2.3k',
    preview: 'Learn the fundamentals of festival production including site planning, vendor coordination, and safety protocols.',
  },
  {
    id: 'budget-management-mastery',
    title: 'Production Budget Management Mastery',
    description: 'Master the art of managing multi-million dollar production budgets without losing your sanity or your shirt.',
    difficulty: 'Advanced',
    duration: '90 min',
    chapters: 12,
    category: 'Financial Management',
    isPremium: true,
    rating: 4.8,
    completions: '1.1k',
    preview: 'Advanced strategies for budget tracking, cost control, and financial risk management in large-scale productions.',
  },
  {
    id: 'crew-coordination-essentials',
    title: 'Crew Coordination Essentials',
    description: 'How to manage teams of 100+ people across multiple departments without everything falling apart.',
    difficulty: 'Intermediate',
    duration: '60 min',
    chapters: 10,
    category: 'Team Management',
    isPremium: false,
    rating: 4.7,
    completions: '1.8k',
    preview: 'Proven methods for organizing large crews, managing schedules, and maintaining communication across departments.',
  },
  {
    id: 'vendor-relationship-building',
    title: 'Building Bulletproof Vendor Relationships',
    description: 'Create vendor partnerships that actually work when the pressure\'s on and deadlines are looming.',
    difficulty: 'Intermediate',
    duration: '40 min',
    chapters: 6,
    category: 'Vendor Management',
    isPremium: true,
    rating: 4.6,
    completions: '950',
    preview: 'Strategies for finding, vetting, and maintaining relationships with reliable suppliers and contractors.',
  },
  {
    id: 'safety-protocols-implementation',
    title: 'Safety Protocols That Actually Work',
    description: 'Implement safety systems that prevent incidents without slowing down production or driving everyone crazy.',
    difficulty: 'Advanced',
    duration: '75 min',
    chapters: 9,
    category: 'Safety Management',
    isPremium: true,
    rating: 4.9,
    completions: '1.4k',
    preview: 'Real-world safety management including risk assessment, protocol development, and incident prevention.',
  },
  {
    id: 'technology-integration-guide',
    title: 'Technology Integration for Production Teams',
    description: 'How to implement new tech solutions without breaking existing workflows or confusing your team.',
    difficulty: 'Intermediate',
    duration: '50 min',
    chapters: 7,
    category: 'Technology',
    isPremium: false,
    rating: 4.5,
    completions: '1.2k',
    preview: 'Practical approach to adopting new technologies, training teams, and managing digital transformation.',
  },
];

const categories = ['All Categories', 'Festival Management', 'Financial Management', 'Team Management', 'Vendor Management', 'Safety Management', 'Technology'];
const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Guides
            </Badge>
            <h1 className={`mb-6 ${typography.heroTitle}`}>
              STEP-BY-STEP
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MASTERY GUIDES
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-8">
              Learn production management the right way with practical, step-by-step guides 
              built from 13+ years of managing everything from cruise entertainment to Formula 1 events. 
              No theory, just what actually works.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Access All Guides
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#guides">
                <Button variant="outline">
                  Browse Free Guides
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-xl border-b">
        <div className="container mx-auto px-md">
          <div className="stack-md">
            <div>
              <h3 className="text-body-sm text-heading-4 color-foreground mb-3">Categories</h3>
              <div className="flex flex-wrap gap-sm">
                {categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant={category === 'All Categories' ? 'primary' : 'outline'} 
                    className="cursor-pointer hover:bg-primary hover:color-primary-foreground transition-colors"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-body-sm text-heading-4 color-foreground mb-3">Difficulty</h3>
              <div className="flex flex-wrap gap-sm">
                {difficulties.map((difficulty) => (
                  <Badge 
                    key={difficulty} 
                    variant={difficulty === 'All Levels' ? 'primary' : 'outline'} 
                    className="cursor-pointer hover:bg-primary hover:color-primary-foreground transition-colors"
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section id="guides" className="py-20">
        <div className="container mx-auto px-md">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {guides.map((guide) => (
              <Card key={guide.id} className="hover:shadow-lg transition-all duration-300 group">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 color-primary mx-auto mb-2" />
                      <p className="text-body-sm color-muted">Guide Preview</p>
                    </div>
                  </div>
                  {guide.isPremium && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="warning">
                        <Lock className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{guide.difficulty}</Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline">{guide.category}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-lg">
                  <h3 className={`mb-3 group-hover:color-primary transition-colors ${typography.cardTitle}`}>
                    {guide.title}
                  </h3>
                  <p className="color-muted mb-4 line-clamp-2">
                    {guide.description}
                  </p>
                  
                  <div className="stack-sm mb-4">
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs color-muted">
                        <Clock className="h-4 w-4" />
                        {guide.duration}
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <BookOpen className="h-4 w-4" />
                        {guide.chapters} chapters
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs">
                        <Star className="h-4 w-4 color-warning fill-current" />
                        <span className="text-heading-4">{guide.rating}</span>
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <CheckCircle className="h-4 w-4" />
                        {guide.completions} completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <p className="text-body-sm color-muted">
                      {guide.preview}
                    </p>
                  </div>
                  
                  <Button 
                    variant={guide.isPremium ? "primary" : "outline"} 
                    size="sm" 
                    className="w-full group-hover:translate-x-1 transition-transform"
                  >
                    {guide.isPremium ? 'Unlock Guide' : 'Start Guide'}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path CTA */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-12">
            <h2 className={`mb-6 ${typography.sectionTitle}`}>
              STRUCTURED LEARNING PATHS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto mb-8">
              Follow curated learning paths designed to take you from beginner to expert 
              in specific areas of production management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xl">
            {[
              {
                title: 'Festival Production Mastery',
                description: 'Complete path from basic festival operations to managing 100K+ attendee events',
                guides: 6,
                duration: '8 hours',
                level: 'Beginner to Advanced',
              },
              {
                title: 'Budget & Financial Management',
                description: 'Master production budgeting from small events to multi-million dollar productions',
                guides: 4,
                duration: '5 hours',
                level: 'Intermediate to Advanced',
              },
              {
                title: 'Team Leadership Excellence',
                description: 'Build skills to lead teams of 10 to 1,000+ across complex productions',
                guides: 5,
                duration: '6 hours',
                level: 'All Levels',
              },
            ].map((path, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-background" />
                  </div>
                  <h3 className={`mb-3 ${typography.cardTitle}`}>
                    {path.title}
                  </h3>
                  <p className="color-muted mb-4">
                    {path.description}
                  </p>
                  <div className="stack-sm text-body-sm color-muted mb-4">
                    <div className="flex justify-between">
                      <span>Guides:</span>
                      <span className="text-heading-4">{path.guides}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-heading-4">{path.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="text-heading-4">{path.level}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Learning Path
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-2xl">
              <BookOpen className="h-16 w-16 color-primary mx-auto mb-6" />
              <h2 className={`mb-6 ${typography.sectionTitle}`}>
                MASTER PRODUCTION MANAGEMENT
              </h2>
              <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
                Get access to our complete library of step-by-step guides, learning paths, 
                and practical exercises. Learn from someone who's managed $15M+ in production budgets.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Start Learning Today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-body-sm color-muted mt-6">
                14-day free trial • Cancel anytime • No setup fees
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
