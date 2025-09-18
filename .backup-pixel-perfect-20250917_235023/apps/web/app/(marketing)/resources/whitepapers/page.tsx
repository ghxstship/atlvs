import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, FileText, Download, Lock, Calendar, Users, TrendingUp, Eye } from 'lucide-react';
import { typography } from '../../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'Whitepapers | GHXSTSHIP Resources',
  description: 'In-depth research and analysis on production management trends, industry insights, and best practices from 13+ years of experience.',
  openGraph: {
    title: 'Whitepapers | GHXSTSHIP Resources',
    description: 'In-depth research and analysis on production management trends, industry insights, and best practices.',
    url: 'https://ghxstship.com/resources/whitepapers',
  },
};

const whitepapers = [
  {
    id: 'future-of-production-management',
    title: 'The Future of Production Management: 2024-2026 Industry Report',
    description: 'Comprehensive analysis of emerging trends, technology adoption, and workforce changes shaping the production industry.',
    publishDate: 'December 2023',
    pages: 42,
    downloads: '3.2k',
    category: 'Industry Analysis',
    isPremium: true,
    featured: true,
    topics: ['Technology Trends', 'Workforce Evolution', 'Market Analysis', 'Future Predictions'],
    preview: 'The production management landscape is undergoing rapid transformation. This report analyzes key trends including AI adoption, remote collaboration tools, and changing workforce expectations.',
  },
  {
    id: 'budget-optimization-strategies',
    title: 'Budget Optimization Strategies for Large-Scale Productions',
    description: 'Data-driven insights on reducing costs while maintaining quality across multi-million dollar production budgets.',
    publishDate: 'October 2023',
    pages: 28,
    downloads: '2.1k',
    category: 'Financial Management',
    isPremium: true,
    featured: false,
    topics: ['Cost Reduction', 'Budget Planning', 'ROI Optimization', 'Risk Management'],
    preview: 'Analysis of 50+ productions reveals key strategies for optimizing budgets without compromising quality or safety standards.',
  },
  {
    id: 'remote-production-playbook',
    title: 'Remote Production Management Playbook',
    description: 'Best practices for managing distributed teams and virtual production workflows in the post-pandemic era.',
    publishDate: 'August 2023',
    pages: 35,
    downloads: '1.8k',
    category: 'Team Management',
    isPremium: false,
    featured: true,
    topics: ['Remote Teams', 'Digital Workflows', 'Communication', 'Technology Stack'],
    preview: 'Practical strategies for maintaining productivity and team cohesion when managing productions across multiple locations and time zones.',
  },
  {
    id: 'safety-compliance-framework',
    title: 'Modern Safety Compliance Framework for Production Environments',
    description: 'Updated safety protocols and compliance strategies for contemporary production challenges and regulations.',
    publishDate: 'June 2023',
    pages: 51,
    downloads: '2.7k',
    category: 'Safety & Compliance',
    isPremium: true,
    featured: false,
    topics: ['Safety Protocols', 'Regulatory Compliance', 'Risk Assessment', 'Incident Prevention'],
    preview: 'Comprehensive framework addressing new safety challenges in modern production environments, including technology integration and remote oversight.',
  },
  {
    id: 'vendor-relationship-study',
    title: 'Vendor Relationship Management: A Data-Driven Approach',
    description: 'Research-backed strategies for building and maintaining productive vendor partnerships in competitive markets.',
    publishDate: 'April 2023',
    pages: 24,
    downloads: '1.5k',
    category: 'Vendor Management',
    isPremium: false,
    featured: false,
    topics: ['Vendor Selection', 'Contract Negotiation', 'Performance Metrics', 'Relationship Building'],
    preview: 'Analysis of vendor relationships across 100+ productions reveals key factors for successful long-term partnerships.',
  },
  {
    id: 'technology-adoption-report',
    title: 'Technology Adoption in Production Management: ROI Analysis',
    description: 'Detailed analysis of technology investments and their impact on production efficiency and profitability.',
    publishDate: 'February 2023',
    pages: 39,
    downloads: '2.4k',
    category: 'Technology',
    isPremium: true,
    featured: false,
    topics: ['Tech ROI', 'Implementation Strategies', 'Change Management', 'Performance Metrics'],
    preview: 'Quantitative analysis of technology investments across various production types, with clear ROI calculations and implementation timelines.',
  },
];

const categories = ['All Categories', 'Industry Analysis', 'Financial Management', 'Team Management', 'Safety & Compliance', 'Vendor Management', 'Technology'];

export default function WhitepapersPage() {
  const featuredPapers = whitepapers.filter(paper => paper.featured);
  const regularPapers = whitepapers.filter(paper => !paper.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Whitepapers
            </Badge>
            <h1 className={`mb-lg ${typography.heroTitle}`}>
              INDUSTRY
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                RESEARCH & INSIGHTS
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Deep-dive research reports and industry analysis based on 13+ years of managing 
              productions from intimate events to 100K+ attendee festivals. Data-driven insights 
              you can actually use.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Download All Reports
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#whitepapers">
                <Button variant="outline">
                  Browse Free Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-xl border-b">
        <div className="container mx-auto px-md">
          <div className="stack-md">
            <h3 className="text-body-sm text-heading-4 color-foreground mb-sm">Categories</h3>
            <div className="flex flex-wrap gap-sm">
              {categories.map((category) => (
                <Badge 
                  key={category} 
                  variant={category === 'All Categories' ? 'default' : 'outline'} 
                  className="cursor-pointer hover:bg-primary hover:color-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Whitepapers */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${typography.sectionTitle}`}>
              FEATURED RESEARCH
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Our most comprehensive and impactful research reports, covering the biggest 
              challenges and opportunities in production management.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-xl mb-4xl">
            {featuredPapers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-modal transition-all duration-300 group">
                <div className="relative">
                  <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-foreground mx-auto mb-md" />
                      <p className="text-body-sm color-muted">Research Report</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary color-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                  {paper.isPremium && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-warning color-warning-foreground">
                        <Lock className="h-3 w-3 mr-xs" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline">{paper.category}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-xl">
                  <h3 className={`mb-md group-hover:text-foreground transition-colors ${typography.cardTitle}`}>
                    {paper.title}
                  </h3>
                  <p className="color-muted mb-lg">
                    {paper.description}
                  </p>
                  
                  <div className="stack-md mb-lg">
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs color-muted">
                        <Calendar className="h-4 w-4" />
                        {paper.publishDate}
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <FileText className="h-4 w-4" />
                        {paper.pages} pages
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs color-muted">
                        <Download className="h-4 w-4" />
                        {paper.downloads} downloads
                      </div>
                      <div className="flex items-center gap-xs">
                        <TrendingUp className="h-4 w-4 color-success" />
                        <span className="text-heading-4 color-success">Popular</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-md mb-lg">
                    <h4 className="text-body-sm text-heading-4 color-foreground mb-sm">Key Topics:</h4>
                    <div className="flex flex-wrap gap-sm mb-md">
                      {paper.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-body-sm">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-body-sm color-muted">
                      {paper.preview}
                    </p>
                  </div>
                  
                  <Button 
                    variant={paper.isPremium ? "primary" : "outline"}
                    className="w-full group-hover:translate-x-1 transition-transform"
                  >
                    {paper.isPremium ? 'Download Premium Report' : 'Download Free Report'}
                    <Download className="ml-sm h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Whitepapers */}
      <section id="whitepapers" className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${typography.sectionTitle}`}>
              ALL RESEARCH REPORTS
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {regularPapers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-floating transition-all duration-300 group">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-foreground mx-auto mb-sm" />
                      <p className="text-body-sm color-muted">Research Report</p>
                    </div>
                  </div>
                  {paper.isPremium && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-warning color-warning-foreground">
                        <Lock className="h-3 w-3 mr-xs" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline">{paper.category}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-lg">
                  <h3 className={`mb-sm group-hover:text-foreground transition-colors ${typography.cardTitle}`}>
                    {paper.title}
                  </h3>
                  <p className="color-muted mb-md line-clamp-2">
                    {paper.description}
                  </p>
                  
                  <div className="stack-sm mb-md">
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs color-muted">
                        <Calendar className="h-4 w-4" />
                        {paper.publishDate}
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <FileText className="h-4 w-4" />
                        {paper.pages} pages
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-xs color-muted">
                        <Download className="h-4 w-4" />
                        {paper.downloads}
                      </div>
                      <div className="flex items-center gap-xs color-muted">
                        <Eye className="h-4 w-4" />
                        Preview
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-md mb-md">
                    <p className="text-body-sm color-muted">
                      {paper.preview}
                    </p>
                  </div>
                  
                  <Button 
                    variant={paper.isPremium ? "primary" : "outline"} 
                    size="sm" 
                    className="w-full group-hover:translate-x-1 transition-transform"
                  >
                    {paper.isPremium ? 'Download Premium' : 'Download Free'}
                    <Download className="ml-xs h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Research Subscription */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-2xl">
            <h2 className={`mb-lg ${typography.sectionTitle}`}>
              RESEARCH SUBSCRIPTION
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto mb-xl">
              Get early access to new research, exclusive industry reports, and quarterly trend analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xl">
            {[
              {
                title: 'Quarterly Industry Reports',
                description: 'Comprehensive analysis of production management trends and market changes',
                frequency: 'Every 3 months',
              },
              {
                title: 'Exclusive Research Access',
                description: 'Early access to all whitepapers and research reports before public release',
                frequency: 'Immediate access',
              },
              {
                title: 'Custom Research Requests',
                description: 'Request specific research topics relevant to your production challenges',
                frequency: 'On demand',
              },
            ].map((benefit, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow text-center">
                <CardContent className="p-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-md">
                    <FileText className="h-8 w-8 text-background" />
                  </div>
                  <h3 className={`mb-sm ${typography.cardTitle}`}>
                    {benefit.title}
                  </h3>
                  <p className="color-muted mb-md">
                    {benefit.description}
                  </p>
                  <Badge variant="outline">{benefit.frequency}</Badge>
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
              <FileText className="h-16 w-16 text-foreground mx-auto mb-lg" />
              <h2 className={`mb-lg ${typography.sectionTitle}`}>
                ACCESS ALL RESEARCH
              </h2>
              <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
                Get unlimited access to our complete library of research reports, industry analysis, 
                and exclusive insights. Learn from data collected across $15M+ in production budgets.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Download All Reports
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
                Instant access • All formats included • Regular updates
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
