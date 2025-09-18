import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, ExternalLink, Download, Mail, Phone, Globe, FileText } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Press & Media - The Real Story Behind the Chaos | GHXSTSHIP',
  description: 'Press coverage, releases, and media kit for the production management company that survived Formula 1 weekends and festival meltdowns.',
  openGraph: {
    title: 'Press & Media - The Real Story Behind the Chaos | GHXSTSHIP',
    description: 'Press coverage and media kit for the production management company that actually works.',
    url: 'https://ghxstship.com/company/press',
  },
};

const pressReleases = [
  {
    title: 'GHXSTSHIP Raises $50M Series B to Build Production Tools That Actually Work',
    date: '2024-01-15',
    excerpt: 'Funding will support building more tools for production teams tired of juggling 47 different apps.',
    category: 'Funding',
    featured: true,
  },
  {
    title: 'GHXSTSHIP Launches AI-Powered Project Intelligence Features',
    date: '2024-01-10',
    excerpt: 'New AI capabilities help creative teams optimize workflows and predict project outcomes.',
    category: 'Product',
  },
  {
    title: 'GHXSTSHIP Partners with Adobe to Streamline Creative Workflows',
    date: '2023-12-20',
    excerpt: 'Strategic partnership integrates GHXSTSHIP with Adobe Creative Suite for seamless collaboration.',
    category: 'Partnership',
  },
  {
    title: 'GHXSTSHIP Surpasses 100,000 Creative Professionals on Platform',
    date: '2023-12-15',
    excerpt: 'Milestone reflects growing adoption of remote creative collaboration tools worldwide.',
    category: 'Milestone',
  },
  {
    title: 'GHXSTSHIP Wins Best Creative Platform at 2023 SaaS Awards',
    date: '2023-11-30',
    excerpt: 'Recognition highlights platform\'s innovation in creative project management and collaboration.',
    category: 'Award',
  },
];

const mediaCoverage = [
  {
    title: 'The Future of Creative Work is Remote and Collaborative',
    publication: 'TechCrunch',
    date: '2024-01-12',
    excerpt: 'How GHXSTSHIP is enabling creative teams to work together seamlessly across the globe.',
    url: 'https://techcrunch.com/ghxstship-remote-creative-work',
  },
  {
    title: 'Top 10 SaaS Startups Transforming Creative Industries',
    publication: 'Forbes',
    date: '2024-01-08',
    excerpt: 'GHXSTSHIP featured among the most promising startups revolutionizing creative collaboration.',
    url: 'https://forbes.com/top-creative-saas-startups',
  },
  {
    title: 'How AI is Reshaping Creative Project Management',
    publication: 'Fast Company',
    date: '2023-12-22',
    excerpt: 'Interview with GHXSTSHIP CEO on the role of AI in creative workflows.',
    url: 'https://fastcompany.com/ai-creative-project-management',
  },
  {
    title: 'The Rise of Global Creative Talent Networks',
    publication: 'Wired',
    date: '2023-12-18',
    excerpt: 'Deep dive into how platforms like GHXSTSHIP are connecting creative talent worldwide.',
    url: 'https://wired.com/global-creative-talent-networks',
  },
  {
    title: 'Remote Creative Teams: The New Normal',
    publication: 'Harvard Business Review',
    date: '2023-12-10',
    excerpt: 'Analysis of remote creative collaboration trends featuring GHXSTSHIP case studies.',
    url: 'https://hbr.org/remote-creative-teams',
  },
];

const awards = [
  {
    title: 'Best Creative Platform 2024',
    organization: 'Creative Industry Awards',
    date: '2024-01-20',
    description: 'Recognized for innovation in creative collaboration tools',
  },
  {
    title: 'Top 50 SaaS Companies to Watch',
    organization: 'TechCrunch',
    date: '2023-12-01',
    description: 'Featured among the most promising SaaS startups',
  },
  {
    title: 'Innovation in Remote Work Award',
    organization: 'Remote Work Association',
    date: '2023-11-15',
    description: 'Awarded for advancing remote creative collaboration',
  },
  {
    title: 'Customer Choice Award',
    organization: 'G2 Reviews',
    date: '2023-10-30',
    description: 'Highest customer satisfaction in project management category',
  },
];

const mediaKit = [
  {
    title: 'Company Logos',
    description: 'High-resolution GHXSTSHIP logos in various formats',
    items: ['SVG', 'PNG', 'EPS', 'PDF'],
  },
  {
    title: 'Product Screenshots',
    description: 'High-quality screenshots of the GHXSTSHIP platform',
    items: ['Dashboard', 'Project Views', 'Collaboration Tools', 'Mobile App'],
  },
  {
    title: 'Executive Photos',
    description: 'Professional headshots of leadership team',
    items: ['CEO', 'CTO', 'Head of Product', 'VP Engineering'],
  },
  {
    title: 'Company Information',
    description: 'Key facts, statistics, and company overview',
    items: ['Fact Sheet', 'Company Timeline', 'Statistics', 'Boilerplate'],
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Press & Media
            </Badge>
            <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
              IN THE
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                SPOTLIGHT
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Stay updated with the latest GHXSTSHIP news, press releases, and media coverage. 
              Access our press kit and connect with our media team.
            </p>

            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Button className="group">
                <Download className="mr-sm h-4 w-4" />
                Download Press Kit
              </Button>
              <Button variant="outline" className="group">
                <Mail className="mr-sm h-4 w-4" />
                Media Inquiries
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Press Release */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="mb-2xl">
            <h2 className={`${anton.className} text-heading-2 text-heading-3 mb-lg uppercase`}>Latest News</h2>
          </div>

          <Card className="overflow-hidden hover:shadow-floating transition-shadow mb-2xl">
            <CardContent className="p-xl">
              <div className="grid lg:grid-cols-2 gap-xl">
                <div>
                  <Badge variant="outline" className="mb-md">
                    {pressReleases[0].category}
                  </Badge>
                  <h3 className={`${anton.className} text-heading-3 lg:text-heading-2 text-heading-3 mb-md uppercase`}>
                    {pressReleases[0].title}
                  </h3>
                  <div className="flex items-center gap-sm text-body-sm color-muted mb-md">
                    <Calendar className="h-4 w-4" />
                    {new Date(pressReleases[0].date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <p className="text-body color-muted mb-lg">
                    {pressReleases[0].excerpt}
                  </p>
                  <Button className="group">
                    Read Full Release
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-xl flex items-center justify-center">
                  <FileText className="h-16 w-16 color-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="mb-2xl">
            <h2 className={`${anton.className} text-heading-2 text-heading-3 mb-lg uppercase`}>Press Releases</h2>
          </div>

          <div className="stack-lg">
            {pressReleases.slice(1).map((release, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-sm">
                        <Badge variant="outline" className="text-body-sm">
                          {release.category}
                        </Badge>
                        <div className="flex items-center gap-sm text-body-sm color-muted">
                          <Calendar className="h-3 w-3" />
                          {new Date(release.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase`}>
                        {release.title}
                      </h3>
                      <p className="color-muted text-body-sm">
                        {release.excerpt}
                      </p>
                    </div>
                    <Button className="group">
                      Read More
                      <ArrowRight className="ml-xs h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-2xl">
            <Button>
              View All Press Releases
            </Button>
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="mb-2xl">
            <h2 className={`${anton.className} text-heading-2 text-heading-3 mb-lg uppercase`}>Media Coverage</h2>
            <p className="text-body color-muted">
              See what industry publications are saying about GHXSTSHIP.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-lg">
            {mediaCoverage.map((article, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow group">
                <CardContent className="p-lg">
                  <div className="flex items-start justify-between gap-md mb-md">
                    <Badge variant="outline" className="text-body-sm">
                      {article.publication}
                    </Badge>
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase group-hover:text-foreground transition-colors`}>
                    {article.title}
                  </h3>
                  <p className="color-muted text-body-sm mb-md">
                    {article.excerpt}
                  </p>
                  
                  <Button variant="outline" className="group">
                    <ExternalLink className="mr-xs h-3 w-3" />
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-2xl">
            <Button variant="primary">
              View All Coverage
            </Button>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              AWARDS & RECOGNITION
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Industry recognition for our innovation and impact in creative collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-lg">
            {awards.map((award, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <div className="flex items-start gap-md">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-background" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase`}>
                        {award.title}
                      </h3>
                      <p className="text-foreground text-heading-4 mb-sm">{award.organization}</p>
                      <div className="flex items-center gap-sm text-body-sm color-muted mb-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(award.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <p className="color-muted text-body-sm">{award.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              MEDIA KIT
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Download high-quality assets, logos, and company information for your coverage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {mediaKit.map((kit) => (
              <Card key={kit.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>
                    {kit.title}
                  </h3>
                  <p className="color-muted mb-md">{kit.description}</p>
                  
                  <div className="stack-sm mb-lg">
                    {kit.items.map((item) => (
                      <div key={item} className="flex items-center gap-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-body-sm color-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full group">
                    <Download className="mr-sm h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-2xl">
            <Button className="group">
              <Download className="mr-sm h-4 w-4" />
              Download Complete Press Kit
            </Button>
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center mb-2xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              MEDIA CONTACT
            </h2>
            <p className="text-body color-muted max-w-2xl mx-auto">
              For press inquiries, interviews, or additional information, please contact our media team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl max-w-4xl mx-auto">
            <Card className="hover:shadow-floating transition-shadow">
              <CardContent className="p-xl text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-md">
                  <Mail className="h-6 w-6 text-foreground" />
                </div>
                <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase`}>
                  Press Inquiries
                </h3>
                <p className="color-muted mb-md">
                  For all media and press related questions
                </p>
                <Button variant="outline" className="group">
                  press@ghxstship.com
                  <ExternalLink className="ml-sm h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-floating transition-shadow">
              <CardContent className="p-xl text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-md">
                  <Phone className="h-6 w-6 text-background" />
                </div>
                <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase`}>
                  Media Relations
                </h3>
                <p className="color-muted mb-md">
                  Sarah Martinez, Head of Communications
                </p>
                <Button variant="outline" className="group">
                  +1 (555) 123-4567
                  <Phone className="ml-sm h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              STAY UPDATED
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Subscribe to our press updates to receive the latest news and announcements 
              directly in your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-md py-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="group">
                Subscribe
                <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              LEARN MORE
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-lg">
            {[
              { title: 'About Us', href: '/company/about', description: 'Our mission, vision, and story' },
              { title: 'Our Team', href: '/company/team', description: 'Meet the people behind GHXSTSHIP' },
              { title: 'Careers', href: '/careers', description: 'Join our growing team' },
            ].map((link) => (
              <a key={link.title} href={link.href as any}>
                <Card className="hover:shadow-floating transition-shadow group">
                  <CardContent className="p-lg text-center">
                    <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase group-hover:text-foreground transition-colors`}>
                      {link.title}
                    </h3>
                    <p className="text-body-sm color-muted">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
