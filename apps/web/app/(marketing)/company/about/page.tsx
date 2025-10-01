import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Users, Target, Globe, Award, TrendingUp, Heart, Zap, Shield } from 'lucide-react';
import { anton, typography } from '../../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'About Us - Built by People Who Actually Do This Stuff | GHXSTSHIP',
  description: 'We\'re the production management company that survived 400K+ festival crowds and Formula 1 chaos. Built by people who\'ve been there.',
  openGraph: {
    title: 'About Us - Built by People Who Actually Do This Stuff | GHXSTSHIP',
    description: 'We\'re the production management company that survived 400K+ festival crowds and Formula 1 chaos.',
    url: 'https://ghxstship.com/company/about',
  },
};

const values = [
  {
    icon: Heart,
    title: 'Chaos-Tested',
    description: 'Our tools are battle-tested in the real world - from 400K+ festival crowds to Formula 1 pressure. If it works there, it\'ll work anywhere.',
  },
  {
    icon: Globe,
    title: 'Actually Useful',
    description: 'We build tools that solve real problems, not features that look good in demos but break when you actually need them.',
  },
  {
    icon: Zap,
    title: 'Zero BS Policy',
    description: 'No corporate fluff, no buzzword bingo. Just honest tools built by people who\'ve been in the trenches.',
  },
  {
    icon: Shield,
    title: 'Reliability Obsessed',
    description: 'When your event is live and 100K people are watching, "it works on my machine" isn\'t good enough. We get that.',
  },
];

const milestones = [
  {
    year: '2011',
    title: 'The Beginning',
    description: 'Julian graduated from Indiana University with a music degree and immediately realized the industry needed better tools',
  },
  {
    year: '2016-2018',
    title: 'Carnival Cruise Line',
    description: 'Revolutionized talent casting operations, reducing 6-week workflows to 5 minutes (yes, really)',
  },
  {
    year: '2022-2023',
    title: 'Festival Circuit',
    description: 'Managed operations for EDC Orlando, Insomniac events, and survived to tell the tale',
  },
  {
    year: '2023',
    title: 'GHXSTSHIP Industries LLC',
    description: 'Founded in Orlando, FL - because someone had to build the tools we actually wanted to use',
  },
  {
    year: '2024',
    title: 'Formula 1 Las Vegas',
    description: 'Managed hospitality for 1,000+ team members at a $500M+ event without breaking anything important',
  },
];

const stats = [
  { metric: '400K+', label: 'Festival Attendees', description: 'Managed through our productions' },
  { metric: '15+', label: 'Countries', description: 'Where we\'ve made magic happen' },
  { metric: '$15M+', label: 'Budgets Managed', description: 'Without losing our minds (mostly)' },
  { metric: '0', label: 'Safety Incidents', description: 'Because nobody has time for that' },
];

const leadership = [
  {
    name: 'Julian Clarkson',
    role: 'Founder & CXO',
    bio: '13+ years surviving the beautiful chaos of live entertainment. From EDC festivals to Formula 1, he\'s the guy who makes impossible deadlines happen.',
    image: '/api/placeholder/150/150',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-mdxl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Our Story
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              BUILT BY PEOPLE
              <br />
              <span className="text-gradient-accent">
                WHO ACTUALLY DO THIS
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Born from 13+ years of wrangling chaos in live entertainment, GHXSTSHIP turns 
              the beautiful madness of creative production into something that actually works. 
              We're the platform that gets built when someone who's survived Formula 1 weekends 
              and EDC festivals decides software should be less painful.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-lg max-w-4xl mx-auto">
              {stats.map((stat: any) => (
                <div key={stat.metric} className="text-center">
                  <div className={`mb-sm color-foreground ${typography.statValue}`}>
                    {stat.metric}
                  </div>
                  <div className="text-heading-4 color-foreground mb-xs">{stat.label}</div>
                  <div className="text-body-sm color-muted">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-xsxl items-center">
            <div>
              <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
                OUR MISSION
              </h2>
              <p className="text-body color-muted mb-xl">
                To build production management tools that don't make you want to throw your laptop 
                out the window. After managing everything from cruise ship entertainment to Formula 1 
                hospitality, we know what actually works when the pressure's on and everything's on fire.
              </p>
              
              <div className="stack-md">
                <div className="flex items-start gap-sm">
                  <Target className="h-icon-sm w-icon-sm text-foreground flex-shrink-0 mt-xs" />
                  <div>
                    <h3 className="text-heading-4 color-foreground mb-xs">Solve Real Problems</h3>
                    <p className="text-body-sm color-muted">Build tools that actually work when you're managing 1,000+ people at 3am</p>
                  </div>
                </div>
                <div className="flex items-start gap-sm">
                  <Users className="h-icon-sm w-icon-sm text-foreground flex-shrink-0 mt-xs" />
                  <div>
                    <h3 className="text-heading-4 color-foreground mb-xs">Battle-Tested Reliability</h3>
                    <p className="text-body-sm color-muted">Software that doesn't break when the stakes are highest and everyone's watching</p>
                  </div>
                </div>
                <div className="flex items-start gap-sm">
                  <TrendingUp className="h-icon-sm w-icon-sm text-foreground flex-shrink-0 mt-xs" />
                  <div>
                    <h3 className="text-heading-4 color-foreground mb-xs">Industry Experience</h3>
                    <p className="text-body-sm color-muted">Built by someone who's actually done this stuff, not just read about it</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-0">
                <CardContent className="p-xl">
                  <h3 className={`mb-md ${anton.className} text-heading-4 text-heading-3 uppercase`}>Our Vision</h3>
                  <p className="color-muted mb-lg">
                    A world where production management doesn't require a PhD in chaos theory. 
                    Where creative professionals can focus on creating instead of fighting with 
                    spreadsheets that break when you look at them wrong.
                  </p>
                  <blockquote className="border-l-4 border-primary pl-md italic color-foreground">
                    "We're building the tools I wish I had when managing 1,000+ crew members 
                    at 3am during Formula 1 weekend. Spoiler alert: it would've been nice."
                  </blockquote>
                  <cite className="text-body-sm color-muted mt-sm block">— Julian Clarkson, Founder & CXO</cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              OUR VALUES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              These core values guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {values.map((value: any) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-lg bg-gradient-to-r from-primary to-secondary">
                        <Icon className="h-icon-md w-icon-md text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`mb-sm ${anton.className} text-heading-4 text-heading-3 uppercase`}>{value.title}</h3>
                        <p className="color-muted">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              OUR JOURNEY
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              From a small startup to a global platform serving creative professionals worldwide.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border"></div>
            
            <div className="space-y-xsxl">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center gap-xl ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <Card className="hover:shadow-floating transition-shadow">
                      <CardContent className="p-lg">
                        <div className={`mb-sm text-foreground ${typography.statValue}`}>
                          {milestone.year}
                        </div>
                        <h3 className={`mb-sm ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                          {milestone.title}
                        </h3>
                        <p className="color-muted">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-icon-xs h-icon-xs bg-accent rounded-full border-4 border-background"></div>
                  </div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              LEADERSHIP TEAM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Meet the experienced leaders driving GHXSTSHIP's vision and growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-xl">
            {leadership.map((leader: any) => (
              <Card key={leader.name} className="text-center hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <div className="w-component-lg h-component-lg bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto mb-md flex items-center justify-center">
                    <Users className="h-icon-lg w-icon-lg text-foreground" />
                  </div>
                  <h3 className={`mb-xs ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {leader.name}
                  </h3>
                  <p className="text-body-sm text-heading-4 text-foreground mb-sm">{leader.role}</p>
                  <p className="text-body-sm color-muted">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              AWARDS & RECOGNITION
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Real-world achievements from actually managing large-scale productions (not just talking about it).
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {[
              {
                title: 'Zero Safety Incidents',
                organization: 'Formula 1 Las Vegas Grand Prix',
                description: 'Managed 1,000+ hospitality team members with perfect safety record',
              },
              {
                title: 'EDC Orlando Success',
                organization: 'Insomniac Events',
                description: 'Streamlined festival production operations for 100,000+ attendees',
              },
              {
                title: 'Workflow Revolution',
                organization: 'Carnival Cruise Line',
                description: 'Reduced talent casting from 6 weeks to 5 minutes (seriously)',
              },
              {
                title: 'Production Excellence',
                organization: 'Salvage City Supper Club',
                description: 'Flawless entertainment production in 24/7 festival environment',
              },
              {
                title: 'Operational Innovation',
                organization: 'Factory Town Miami',
                description: '45% efficiency improvement while maintaining zero safety incidents',
              },
              {
                title: 'Multi-Million Dollar Management',
                organization: 'Various Productions',
                description: 'Successfully managed $15M+ in production budgets without losing sanity',
              },
            ].map((award: any) => (
              <Card key={award.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-icon-2xl h-icon-2xl bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-md">
                    <Award className="h-icon-md w-icon-md text-background" />
                  </div>
                  <h3 className={`mb-sm ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {award.title}
                  </h3>
                  <p className="text-body-sm text-heading-4 text-foreground mb-sm">{award.organization}</p>
                  <p className="text-body-sm color-muted">{award.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-mdxl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              JOIN OUR MISSION
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Ready to use production tools that don't suck? Join the growing number of 
              professionals who are tired of fighting with software that breaks when you need it most.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Creating
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/careers">
                <Button className="w-full sm:w-auto">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              LEARN MORE
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-lg">
            {[
              { title: 'Our Team', href: '/company/team', description: 'Meet the people behind GHXSTSHIP' },
              { title: 'Press & Media', href: '/company/press', description: 'Latest news and press coverage' },
              { title: 'Careers', href: '/careers', description: 'Join our growing team' },
            ].map((link: any) => (
              <a key={link.title} href={link.href}>
                <Card className="hover:shadow-floating transition-shadow group">
                  <CardContent className="p-lg text-center">
                    <h3 className={`mb-sm group-hover:text-foreground transition-colors ${anton.className} text-heading-4 text-heading-3 uppercase`}>
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
