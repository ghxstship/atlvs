import { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge, H1, H2, Icon, IconWithText } from '@ghxstship/ui';
import { Users, Target, Globe, Award, TrendingUp, Heart, Calendar, MapPin, ArrowRight, ExternalLink, Mail } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'About Us - Building the Future of Creative Production | GHXSTSHIP',
  description: 'Learn about GHXSTSHIP\'s mission, team, and commitment to revolutionizing creative production management.',
  openGraph: {
    title: 'About Us - Building the Future of Creative Production | GHXSTSHIP',
    description: 'Learn about GHXSTSHIP\'s mission, team, and commitment to revolutionizing creative production management.',
    url: 'https://ghxstship.com/company',
  },
};

const leadership = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former VP of Production at Netflix, led digital transformation initiatives for major studios.',
    image: '/team/sarah-chen.jpg',
    linkedin: 'https://linkedin.com/in/sarahchen',
    twitter: 'https://twitter.com/sarahchen',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineering lead, specialized in scalable production systems and AI/ML.',
    image: '/team/marcus-rodriguez.jpg',
    linkedin: 'https://linkedin.com/in/marcusrodriguez',
    twitter: 'https://twitter.com/marcusrodriguez',
  },
  {
    name: 'Emily Watson',
    role: 'VP of Product',
    bio: 'Product strategy veteran from Adobe, expert in creative workflow optimization.',
    image: '/team/emily-watson.jpg',
    linkedin: 'https://linkedin.com/in/emilywatson',
  },
  {
    name: 'David Kim',
    role: 'VP of Engineering',
    bio: 'Former Principal Engineer at Spotify, passionate about developer experience.',
    image: '/team/david-kim.jpg',
    linkedin: 'https://linkedin.com/in/davidkim',
  },
  {
    name: 'Lisa Thompson',
    role: 'VP of Customer Success',
    bio: 'Customer experience leader from Salesforce, focused on client growth and satisfaction.',
    image: '/team/lisa-thompson.jpg',
    linkedin: 'https://linkedin.com/in/lisathompson',
  },
  {
    name: 'Alex Rivera',
    role: 'VP of Marketing',
    bio: 'Growth marketing expert from HubSpot, specializes in B2B SaaS scaling.',
    image: '/team/alex-rivera.jpg',
    linkedin: 'https://linkedin.com/in/alexrivera',
  },
];

const milestones = [
  {
    year: '2019',
    title: 'Company Founded',
    description: 'GHXSTSHIP was founded with a vision to revolutionize creative production management.',
  },
  {
    year: '2020',
    title: 'Series A Funding',
    description: 'Raised $15M Series A led by Andreessen Horowitz to accelerate product development.',
  },
  {
    year: '2021',
    title: 'ATLVS Launch',
    description: 'Launched our flagship production management platform, serving 100+ studios.',
  },
  {
    year: '2022',
    title: 'International Expansion',
    description: 'Expanded to Europe and Asia, establishing offices in London and Singapore.',
  },
  {
    year: '2023',
    title: 'OPENDECK Launch',
    description: 'Introduced our creative asset management platform, reaching 1M+ users.',
  },
  {
    year: '2024',
    title: 'AI Integration',
    description: 'Launched AI-powered insights and automation features across our platform.',
  },
];

const awards = [
  {
    title: 'Best SaaS Product 2024',
    organization: 'SaaS Awards',
    year: '2024',
  },
  {
    title: 'Innovation in Creative Tech',
    organization: 'Creative Industry Awards',
    year: '2024',
  },
  {
    title: 'Top 50 Startups to Watch',
    organization: 'TechCrunch',
    year: '2023',
  },
  {
    title: 'Best Workplace Culture',
    organization: 'Great Place to Work',
    year: '2023',
  },
];

const pressReleases = [
  {
    title: 'GHXSTSHIP Raises $50M Series B to Accelerate AI Development',
    date: 'December 15, 2024',
    publication: 'TechCrunch',
    href: '/press/series-b-funding',
  },
  {
    title: 'Major Studios Adopt GHXSTSHIP for Next-Gen Production Management',
    date: 'November 28, 2024',
    publication: 'Variety',
    href: '/press/major-studios-adoption',
  },
  {
    title: 'GHXSTSHIP Partners with Leading VFX Houses for Workflow Integration',
    date: 'November 10, 2024',
    publication: 'The Hollywood Reporter',
    href: '/press/vfx-partnerships',
  },
  {
    title: 'GHXSTSHIP Expands to Asia-Pacific with Singapore Office Opening',
    date: 'October 22, 2024',
    publication: 'Forbes',
    href: '/press/apac-expansion',
  },
];

const offices = [
  {
    city: 'San Francisco',
    address: '123 Market Street, Suite 500',
    country: 'United States',
    isHQ: true,
  },
  {
    city: 'London',
    address: '45 Shoreditch High Street',
    country: 'United Kingdom',
    isHQ: false,
  },
  {
    city: 'Singapore',
    address: '1 Marina Bay Drive',
    country: 'Singapore',
    isHQ: false,
  },
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              About GHXSTSHIP
            </Badge>
            <H1 className={`${anton.className} lg:text-display uppercase mb-6`}>
              LEADERSHIP TEAM
            </H1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-8">
              We're on a mission to empower creative teams worldwide with intelligent, 
              intuitive production management tools that unlock their full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/careers">
                <Button className="group transition-all duration-200 hover:scale-105">
                  Join Our Team
                  <Icon icon={ArrowRight} size="sm" className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-xl max-w-4xl mx-auto">
            {[
              { label: 'Team Members', value: '150+' },
              { label: 'Countries', value: '25+' },
              { label: 'Studios Served', value: '500+' },
              { label: 'Years of Innovation', value: '5+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 color-primary mb-2`}>
                  {stat.value}
                </div>
                <div className="color-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-sm mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon icon={Target} size="lg" color="primary" />
                </div>
                <h2 className={`${anton.className} text-heading-2 uppercase`}>OUR MISSION</h2>
              </div>
              <p className="text-body color-muted mb-6">
                To democratize professional production management by providing creative teams 
                with enterprise-grade tools that are intuitive, powerful, and accessible to 
                organizations of all sizes.
              </p>
              <p className="color-muted">
                We believe that great creative work shouldn't be hindered by poor project 
                management. Our platform eliminates the friction between creative vision 
                and execution, allowing teams to focus on what they do best.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-sm mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon icon={Globe} size="lg" className="text-accent" />
                </div>
                <h2 className={`${anton.className} text-heading-2 uppercase`}>OUR VISION</h2>
              </div>
              <p className="text-body color-muted mb-6">
                To become the global standard for creative production management, 
                powering the next generation of films, shows, campaigns, and creative 
                projects worldwide.
              </p>
              <p className="color-muted">
                We envision a world where creative teams can seamlessly collaborate 
                across time zones, disciplines, and platforms, bringing their boldest 
                ideas to life with unprecedented efficiency and quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <H2 className="mb-6 uppercase">
              LEADERSHIP TEAM
            </H2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Meet the experienced leaders driving innovation and growth at GHXSTSHIP.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {leadership.map((member) => (
              <Card key={member.name} className="text-center" interactive>
                <CardContent className="p-xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-12 w-12 color-primary" />
                  </div>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-2 uppercase`}>{member.name}</h3>
                  <div className="color-primary text-heading-4 mb-4">{member.role}</div>
                  <p className="text-body-sm color-muted mb-6">{member.bio}</p>
                  <div className="flex justify-center gap-sm">
                    {member.linkedin && (
                      <a href={member.linkedin as any as any} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105">
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter as any as any} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105">
                          Twitter
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <H2 className="mb-6 uppercase">
              OUR JOURNEY
            </H2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              From startup to industry leader, here are the key milestones in our story.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="relative flex items-start gap-xl">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center color-primary-foreground text-heading-3 relative z-10">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-sm mb-3">
                        <Calendar className="h-5 w-5 color-primary" />
                        <span className="text-body-sm text-heading-4 color-primary">{milestone.year}</span>
                      </div>
                      <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-3 uppercase`}>{milestone.title}</h3>
                      <p className="color-muted">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <H2 className="mb-6 uppercase">
              AWARDS & RECOGNITION
            </H2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We're honored to be recognized by industry leaders and organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {awards.map((award) => (
              <Card key={award.title} className="text-center" interactive variant="elevated">
                <CardContent className="p-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-8 w-8 color-warning" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-2">{award.title}</h3>
                  <p className="text-body-sm color-muted mb-2">{award.organization}</p>
                  <Badge variant="secondary" className="text-body-sm">
                    {award.year}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press & Media */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <H2 className="mb-6 uppercase">
              PRESS & MEDIA
            </H2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Latest news and coverage about GHXSTSHIP in the media.
            </p>
          </div>

          <div className="max-w-4xl mx-auto stack-lg">
            {pressReleases.map((press) => (
              <Card key={press.href} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-lg">
                  <div className="flex items-start justify-between gap-lg">
                    <div className="flex-1">
                      <h3 className="text-heading-4 color-foreground mb-2 hover:color-primary transition-colors">
                        {press.title}
                      </h3>
                      <div className="flex items-center gap-md text-body-sm color-muted">
                        <span>{press.publication}</span>
                        <span>•</span>
                        <span>{press.date}</span>
                      </div>
                    </div>
                    <a href={press.href as any as any}>
                      <Button size="sm" variant="outline" className="group transition-all duration-200 hover:scale-105">
                        Read More
                        <ExternalLink className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/press">
              <Button className="group transition-all duration-200 hover:scale-105">
                View All Press Releases
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Global Offices */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <H2 className="mb-6 uppercase">
              GLOBAL PRESENCE
            </H2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We're building a global team with offices around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xl max-w-4xl mx-auto">
            {offices.map((office) => (
              <Card key={office.city} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-lg">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-8 w-8 color-primary" />
                  </div>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-2 uppercase`}>
                    {office.city}
                    {office.isHQ && (
                      <Badge variant="secondary" className="ml-2 text-body-sm">
                        HQ
                      </Badge>
                    )}
                  </h3>
                  <p className="text-body-sm color-muted mb-2">{office.address}</p>
                  <p className="text-body-sm color-muted">{office.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-2xl">
              <h3 className={`${anton.className} text-heading-2 mb-6 uppercase`}>
                LET'S WORK TOGETHER
              </h3>
              <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
                Whether you're interested in joining our team, partnering with us, 
                or learning more about our solutions, we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/careers">
                  <Button className="transition-all duration-200 hover:scale-105">
                    <Users className="mr-2 h-4 w-4" />
                    View Open Positions
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                    <Mail className="mr-2 h-4 w-4" />
                    Get in Touch
                  </Button>
                </Link>
                <Link href="/partnerships">
                  <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                    Partner with Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
