import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Target, Globe, Award, TrendingUp, Heart, Calendar, MapPin, ArrowRight, ExternalLink, Mail } from 'lucide-react';
import { Badge, Card, CardContent, Button } from '@ghxstship/ui';
import { anton } from '../../_components/lib/typography';

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
      <section className="py-mdxl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              About GHXSTSHIP
            </Badge>
            <h1 className="text-heading-1">
              LEADERSHIP TEAM
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              We're on a mission to empower creative teams worldwide with intelligent, 
              intuitive production management tools that unlock their full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/careers">
                <Button className="group transition-all duration-200 hover:scale-105">
                  Join Our Team
                  <ArrowRight className="h-icon-xs w-icon-xs ml-sm transition-transform group-hover:translate-x-1" />
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
            ].map((stat: any) => (
              <div key={stat.label} className="text-center">
                <div className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 text-foreground mb-sm`}>
                  {stat.value}
                </div>
                <div className="color-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-smxl items-center">
            <div>
              <div className="flex items-center gap-sm mb-lg">
                <div className="w-icon-2xl h-icon-2xl bg-accent/10 rounded-lg flex items-center justify-center">
                  <Target className="h-icon-md w-icon-md color-accent" />
                </div>
                <h2 className={`${anton.className} text-heading-2 uppercase`}>OUR MISSION</h2>
              </div>
              <p className="text-body color-muted mb-lg">
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
              <div className="flex items-center gap-sm mb-lg">
                <div className="w-icon-2xl h-icon-2xl bg-accent/10 rounded-lg flex items-center justify-center">
                  <Globe className="h-icon-md w-icon-md text-foreground" />
                </div>
                <h2 className={`${anton.className} text-heading-2 uppercase`}>OUR VISION</h2>
              </div>
              <p className="text-body color-muted mb-lg">
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
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className="text-heading-2">
              LEADERSHIP TEAM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Meet the experienced leaders driving innovation and growth at GHXSTSHIP.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {leadership.map((member: any) => (
              <Card key={member.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-xl">
                  <div className="w-component-lg h-component-lg bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto mb-lg flex items-center justify-center">
                    <Users className="h-icon-2xl w-icon-2xl text-foreground" />
                  </div>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{member.name}</h3>
                  <div className="text-foreground text-heading-4 mb-md">{member.role}</div>
                  <p className="text-body-sm color-muted mb-lg">{member.bio}</p>
                  <div className="flex justify-center gap-sm">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105">
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer">
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
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className="text-heading-2">
              OUR JOURNEY
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              From startup to industry leader, here are the key milestones in our story.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="space-y-xsxl">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="relative flex items-start gap-xl">
                    <div className="flex-shrink-0 w-component-md h-component-md bg-accent rounded-full flex items-center justify-center color-accent-foreground text-heading-3 relative z-10">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 pb-xl">
                      <div className="flex items-center gap-sm mb-sm">
                        <Calendar className="h-icon-sm w-icon-sm text-foreground" />
                        <span className="text-body-sm text-heading-4 text-foreground">{milestone.year}</span>
                      </div>
                      <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{milestone.title}</h3>
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
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className="text-heading-2">
              AWARDS & RECOGNITION
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We're honored to be recognized by industry leaders and organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {awards.map((award: any) => (
              <Card key={award.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-lg">
                  <div className="w-component-md h-component-md bg-gradient-to-br from-warning/20 to-warning/30 rounded-full mx-auto mb-md flex items-center justify-center">
                    <Award className="h-icon-lg w-icon-lg color-warning" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-sm">{award.title}</h3>
                  <p className="text-body-sm color-muted mb-sm">{award.organization}</p>
                  <Badge variant="outline">
                    {award.year}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press & Media */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className="text-heading-2">
              PRESS & MEDIA
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Latest news and coverage about GHXSTSHIP in the media.
            </p>
          </div>

          <div className="max-w-4xl mx-auto stack-lg">
            {pressReleases.map((press: any) => (
              <Card key={press.href} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <div className="flex items-start justify-between gap-lg">
                    <div className="flex-1">
                      <h3 className="text-heading-4 color-foreground mb-sm hover:text-foreground transition-colors">
                        {press.title}
                      </h3>
                      <div className="flex items-center gap-md text-body-sm color-muted">
                        <span>{press.publication}</span>
                        <span>•</span>
                        <span>{press.date}</span>
                      </div>
                    </div>
                    <a href={press.href}>
                      <Button size="sm" variant="outline" className="group transition-all duration-200 hover:scale-105">
                        Read More
                        <ExternalLink className="ml-sm h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-2xl">
            <a href="/press">
              <Button className="group transition-all duration-200 hover:scale-105">
                View All Press Releases
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Global Offices */}
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className="text-heading-2">
              GLOBAL PRESENCE
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We're building a global team with offices around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xl max-w-4xl mx-auto">
            {offices.map((office: any) => (
              <Card key={office.city} className="text-center hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <div className="w-component-md h-component-md bg-accent/10 rounded-full mx-auto mb-md flex items-center justify-center">
                    <MapPin className="h-icon-lg w-icon-lg text-foreground" />
                  </div>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>
                    {office.city}
                    {office.isHQ && (
                      <Badge variant="secondary" className="ml-sm text-body-sm">
                        HQ
                      </Badge>
                    )}
                  </h3>
                  <p className="text-body-sm color-muted mb-sm">{office.address}</p>
                  <p className="text-body-sm color-muted">{office.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-xsxl">
              <h3 className={`${anton.className} text-heading-2 mb-lg uppercase`}>
                LET'S WORK TOGETHER
              </h3>
              <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
                Whether you're interested in joining our team, partnering with us, 
                or learning more about our solutions, we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/careers">
                  <Button className="transition-all duration-200 hover:scale-105">
                    <Users className="mr-sm h-icon-xs w-icon-xs" />
                    View Open Positions
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                    <Mail className="mr-sm h-icon-xs w-icon-xs" />
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
