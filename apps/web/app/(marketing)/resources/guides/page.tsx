import type { Metadata } from 'next';
import { anton } from '../../../_components/lib/typography';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, BookOpen, Clock, Users, Star, Lock, Eye, CheckCircle } from 'lucide-react';
import { MarketingSection } from '../../../_components/marketing';

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
      <MarketingSection className=" bg-gradient-subtle" padding="lg">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Guides
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              STEP-BY-STEP
              <br />
              <span className="text-gradient-accent">
                MASTERY GUIDES
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Learn production management the right way with practical, step-by-step guides 
              built from 13+ years of managing everything from cruise entertainment to Formula 1 events. 
              No theory, just what actually works.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Access All Guides
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
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
      </MarketingSection>

      {/* Filters */}
      <MarketingSection className="py-xl border-b" padding="md">
        <div className="container mx-auto px-md">
          <div className="stack-md">
            <div>
              <h3 className="text-body-sm text-heading-4 color-foreground mb-sm">Categories</h3>
              <div className="flex flex-wrap gap-sm">
                {categories.map((category: any) => (
                  <Badge 
                    key={category} 
                    variant={category === 'All Categories' ? 'default' : 'outline'} 
                    className="cursor-pointer transition-colors hover:bg-foreground/5 hover:text-accent"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-body-sm text-heading-4 color-foreground mb-sm">Difficulty</h3>
              <div className="flex flex-wrap gap-sm">
                {difficulties.map((difficulty: any) => (
                  <Badge 
                    key={difficulty} 
                    variant={difficulty === 'All Levels' ? 'default' : 'outline'} 
                    className="cursor-pointer transition-colors hover:bg-foreground/5 hover:text-accent"
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Guides Grid */}
      <MarketingSection id="guides"  padding="md">
        <div className="container mx-auto px-md">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {guides.map((guide: any) => (
              <Card key={guide.id} className="hover:shadow-elevation-3 transition-all duration-normal group">
                <div className="relative">
                  <div className="h-container-xs bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-icon-2xl w-icon-2xl text-foreground mx-auto mb-sm" />
                      <p className="text-body-sm color-muted">Guide Preview</p>
                    </div>
                  </div>
                  {guide.isPremium && (
                    <div className="absolute top-md right-4">
                      <Badge variant="warning">
                        <Lock className="h-3 w-3 mr-xs" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-md left-4">
                    <Badge variant="secondary">{guide.difficulty}</Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline">{guide.category}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-lg">
                  <h3 className={`mb-sm group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {guide.title}
                  </h3>
                  <p className="color-muted mb-md line-clamp-xs">
                    {guide.description}
                  </p>
                  
                  <div className="stack-sm mb-md">
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs color-muted">
                        <Clock className="h-icon-xs w-icon-xs" />
                        {guide.duration}
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <BookOpen className="h-icon-xs w-icon-xs" />
                        {guide.chapters} chapters
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs">
                        <Star className="h-icon-xs w-icon-xs color-warning fill-current" />
                        <span>{guide.rating}</span>
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <CheckCircle className="h-icon-xs w-icon-xs" />
                        {guide.completions} completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-md mb-md">
                    <p className="text-body-sm color-muted">
                      {guide.preview}
                    </p>
                  </div>
                  
                  <Button 
                    variant={guide.isPremium ? "default" : "outline"} 
                    size="sm" 
                    className="w-full group-hover:translate-x-1 transition-transform"
                  >
                    {guide.isPremium ? 'Unlock Guide' : 'Start Guide'}
                    <ArrowRight className="ml-xs h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MarketingSection>

      {/* Learning Path CTA */}
      <MarketingSection className=" bg-secondary/20" padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center mb-2xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              STRUCTURED LEARNING PATHS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto mb-xl">
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
              <Card key={index} className="hover:shadow-elevation-3 transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-component-md h-component-md bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-md">
                    <BookOpen className="h-icon-lg w-icon-lg text-background" />
                  </div>
                  <h3 className={`mb-sm ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {path.title}
                  </h3>
                  <p className="color-muted mb-md">
                    {path.description}
                  </p>
                  <div className="stack-sm text-body-sm color-muted mb-md">
                    <div className="flex justify-between">
                      <span>Guides:</span>
                      <span>{path.guides}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{path.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span>{path.level}</span>
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
      </MarketingSection>

      {/* CTA Section */}
      <MarketingSection className=" bg-gradient-to-r from-primary/5 to-accent/5" padding="md">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-xsxl">
              <BookOpen className="h-component-md w-component-md text-foreground mx-auto mb-lg" />
              <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
                MASTER PRODUCTION MANAGEMENT
              </h2>
              <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
                Get access to our complete library of step-by-step guides, learning paths, 
                and practical exercises. Learn from someone who's managed $15M+ in production budgets.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Start Learning Today
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-body-sm color-muted mt-lg">
                14-day free trial • Cancel anytime • No setup fees
              </p>
            </CardContent>
          </Card>
        </div>
      </MarketingSection>
    </div>
  );
}
