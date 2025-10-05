import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  Award,
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'About Us - Building the Future of Creative Production | GHXSTSHIP',
  description:
    "Learn about GHXSTSHIP's mission, team, and commitment to revolutionizing creative production management.",
  openGraph: {
    title: 'About Us - Building the Future of Creative Production | GHXSTSHIP',
    description:
      "Learn about GHXSTSHIP's mission, team, and commitment to revolutionizing creative production management.",
    url: 'https://ghxstship.com/company',
  },
};

const heroStats = [
  { label: 'Studios & Agencies', value: '1,200+' },
  { label: 'Enterprise Clients', value: '500+' },
  { label: 'Countries Served', value: '50+' },
  { label: 'Team Members', value: '320+' },
];

const leadership = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former Netflix production exec leading global transformation programs for major studios.',
    image: '/team/sarah-chen.jpg',
    linkedin: 'https://linkedin.com/in/sarahchen',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineering leader focused on AI automation and large-scale infrastructure.',
    image: '/team/marcus-rodriguez.jpg',
    linkedin: 'https://linkedin.com/in/marcusrodriguez',
  },
  {
    name: 'Emily Watson',
    role: 'VP of Product',
    bio: 'Built creative workflow platforms at Adobe; obsessed with shipping inclusive experiences.',
    image: '/team/emily-watson.jpg',
    linkedin: 'https://linkedin.com/in/emilywatson',
  },
  {
    name: 'David Kim',
    role: 'VP of Engineering',
    bio: 'Former Spotify principal engineer building high-availability systems for global teams.',
    image: '/team/david-kim.jpg',
    linkedin: 'https://linkedin.com/in/davidkim',
  },
  {
    name: 'Lisa Thompson',
    role: 'VP of Customer Success',
    bio: 'SaaS veteran from Salesforce helping enterprises realize rapid time-to-value.',
    image: '/team/lisa-thompson.jpg',
    linkedin: 'https://linkedin.com/in/lisathompson',
  },
  {
    name: 'Alex Rivera',
    role: 'VP of Marketing',
    bio: 'Growth marketing leader from HubSpot scaling B2B demand worldwide.',
    image: '/team/alex-rivera.jpg',
    linkedin: 'https://linkedin.com/in/alexrivera',
  },
];

const milestones = [
  { year: '2019', title: 'Company Founded', description: 'Set out to reinvent production operations after decades in the industry.' },
  { year: '2020', title: 'Series A', description: 'Raised $15M led by Andreessen Horowitz to accelerate product development.' },
  { year: '2021', title: 'ATLVS Launch', description: 'Introduced our production management platform, serving 100+ studios in year one.' },
  { year: '2022', title: 'Global Expansion', description: 'Opened London and Singapore offices to support international productions.' },
  { year: '2023', title: 'OPENDECK Launch', description: 'Released the creative marketplace powering 1M+ talent connections.' },
  { year: '2024', title: 'AI Automation', description: 'Shipped AI copilots and predictive analytics across the GHXSTSHIP suite.' },
];

const awards = [
  { title: 'Best SaaS Product', organization: 'SaaS Awards', year: '2024' },
  { title: 'Innovation in Creative Tech', organization: 'Creative Industry Awards', year: '2024' },
  { title: 'Top 50 Startups to Watch', organization: 'TechCrunch', year: '2023' },
  { title: 'Best Workplace Culture', organization: 'Great Place to Work', year: '2023' },
];

const pressReleases = [
  {
    title: 'GHXSTSHIP Raises $50M Series B to Accelerate AI Development',
    date: 'Dec 15, 2024',
    publication: 'TechCrunch',
    href: '/press/series-b-funding',
  },
  {
    title: 'Major Studios Adopt GHXSTSHIP for Next-Gen Production Management',
    date: 'Nov 28, 2024',
    publication: 'Variety',
    href: '/press/major-studios-adoption',
  },
  {
    title: 'GHXSTSHIP Partners with Leading VFX Houses for Workflow Integration',
    date: 'Nov 10, 2024',
    publication: 'The Hollywood Reporter',
    href: '/press/vfx-partnerships',
  },
  {
    title: 'GHXSTSHIP Expands to Asia-Pacific with Singapore Office Opening',
    date: 'Oct 22, 2024',
    publication: 'Forbes',
    href: '/press/apac-expansion',
  },
];

const offices = [
  { city: 'San Francisco', address: '123 Market Street, Suite 500', country: 'United States', isHQ: true },
  { city: 'New York', address: '77 Hudson Yards', country: 'United States', isHQ: false },
  { city: 'London', address: '45 Shoreditch High Street', country: 'United Kingdom', isHQ: false },
  { city: 'Singapore', address: '8 Marina Boulevard', country: 'Singapore', isHQ: false },
  { city: 'Sydney', address: '201 Kent Street', country: 'Australia', isHQ: false },
  { city: 'Toronto', address: '150 King Street West', country: 'Canada', isHQ: false },
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Our Story"
          title="Built By Production Veterans For Production Teams"
          highlight="Production"
          description="GHXSTSHIP emerged from years of managing billion-dollar productions, world tours, and live events. We’re building the platform we wished existed when deadlines loomed and stakes were sky high."
          actions={
            <Link href="/company/about">
              <Button className="group" size="lg">
                Explore Our Journey
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={heroStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Mission & Impact"
          title="Why We Exist"
          description="We’re here to remove the chaos from creative operations so teams can focus on the work that shapes culture."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          <MarketingCard
            title="Purpose-Built Software"
            description="Our product decisions come from firsthand experience running stadium tours, live broadcasts, and franchise films."
            icon={<Target className="h-icon-md w-icon-md" />}
          />
          <MarketingCard
            title="Global Collaboration"
            description="Cross-location scheduling, payroll, and compliance—streamlined so your teams can collaborate in real time."
            icon={<Globe className="h-icon-md w-icon-md" />}
          />
          <MarketingCard
            title="Measurable Outcomes"
            description="Customers cut scheduling time by 40%, reduce overruns, and gain clarity across every production stage."
            icon={<TrendingUp className="h-icon-md w-icon-md" />}
          />
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Leadership"
          title="Meet The Team Steering GHXSTSHIP"
          description="Operators, engineers, and storytellers united around designing tools that actually work when the pressure is on."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {leadership.map((leader) => (
            <Card key={leader.name} className="border border-border bg-card shadow-sm">
              <CardContent className="flex flex-col gap-md p-xl">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                  <img src={leader.image} alt={leader.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-xs">
                  <h3 className="text-heading-4 uppercase leading-tight">{leader.name}</h3>
                  <p className="text-body-sm text-muted-foreground">{leader.role}</p>
                </div>
                <p className="text-body-sm text-muted-foreground leading-relaxed">{leader.bio}</p>
                <div className="flex gap-sm">
                  <Link href={leader.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Milestones"
          title="From Launch To Global Scale"
          description="Every year we push GHXSTSHIP forward with new capabilities, partnerships, and geographic expansion."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {milestones.map((milestone) => (
            <MarketingCard
              key={milestone.year}
              title={`${milestone.year} · ${milestone.title}`}
              description={milestone.description}
              icon={<Calendar className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Recognition"
          title="Awards & Industry Honors"
          description="We’re grateful to be recognized by the organizations that inspire us to keep raising the bar."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {awards.map((award) => (
            <MarketingCard
              key={award.title}
              title={award.title}
              description={`${award.organization} · ${award.year}`}
              icon={<Award className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Press"
          title="Latest Headlines"
          description="Browse the latest news, funding announcements, and product coverage from leading publications."
        />

        <div className="mt-2xl space-y-lg">
          {pressReleases.map((press) => (
            <Card key={press.href} className="border border-border bg-card shadow-sm">
              <CardContent className="flex flex-col gap-md p-xl md:flex-row md:items-center md:justify-between">
                <div className="space-y-xs">
                  <h3 className="text-heading-4 uppercase leading-tight">{press.title}</h3>
                  <p className="text-body-sm text-muted-foreground">
                    {press.publication} · {press.date}
                  </p>
                </div>
                <Link href={press.href}>
                  <Button variant="outline" className="group">
                    Read More
                    <ExternalLink className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-xl text-center">
          <Link href="/press">
            <Button className="group">
              View Press Room
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Global Presence"
          title="Where You Can Find Us"
          description="We’re a remote-first team with hubs across North America, Europe, and Asia-Pacific."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {offices.map((office) => (
            <MarketingCard
              key={office.city}
              title={office.city}
              description={`${office.address} · ${office.country}`}
              highlight={office.isHQ ? 'Headquarters' : undefined}
              icon={<MapPin className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Let’s Build The Future Together"
          description="Interested in partnering, joining the team, or covering GHXSTSHIP? We’d love to connect."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/careers">
            <Button className="group">
              View Careers
              <Users className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
          <Link href="/partnerships">
            <Button variant="outline" className="group">
              Explore Partnerships
              <Globe className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
          <Link href="mailto:hello@ghxstship.com">
            <Button variant="outline" className="group">
              Contact Us
              <Mail className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
