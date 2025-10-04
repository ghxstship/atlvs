import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Calendar, Eye, Heart, Image, Trophy, ExternalLink, Video } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community Showcase - Featured Projects & Achievements | GHXSTSHIP',
  description: 'Explore amazing community projects, creative achievements, and inspiring work from our 25,000+ creative professionals.',
  openGraph: {
    title: 'Community Showcase - Featured Projects & Achievements | GHXSTSHIP',
    description: 'Explore amazing community projects, creative achievements, and inspiring work from our 25,000+ creative professionals.',
    url: 'https://ghxstship.com/community/showcase',
  },
};

const featuredProjects = [
  {
    id: 'stellar-awakening',
    title: 'Stellar Awakening',
    creator: 'Maya Chen',
    role: 'Production Designer',
    category: 'Film Production',
    description: 'A groundbreaking sci-fi feature film that pushed the boundaries of visual effects and production design.',
    image: '/images/showcase/stellar-awakening.jpg',
    views: '12.5K',
    likes: '2.8K',
    awards: ['Best Production Design', 'Technical Achievement'],
    technologies: ['Unreal Engine 5', 'Motion Capture', 'LED Volume'],
    budget: '$45M',
    duration: '2 years',
    team: '85 people',
  },
  {
    id: 'urban-rhythms',
    title: 'Urban Rhythms',
    creator: 'Carlos Rodriguez',
    role: 'Event Producer',
    category: 'Live Event',
    description: 'A multi-sensory music festival that transformed urban spaces into immersive art installations.',
    image: '/images/showcase/urban-rhythms.jpg',
    views: '8.9K',
    likes: '1.6K',
    awards: ['Innovation in Live Entertainment'],
    technologies: ['Interactive Lighting', 'Spatial Audio', 'AR Experiences'],
    budget: '$2.8M',
    duration: '6 months',
    team: '120 people',
  },
  {
    id: 'digital-frontier',
    title: 'Digital Frontier',
    creator: 'Sarah Johnson',
    role: 'Creative Director',
    category: 'Digital Campaign',
    description: 'An interactive brand campaign that redefined digital storytelling through immersive web experiences.',
    image: '/images/showcase/digital-frontier.jpg',
    views: '15.2K',
    likes: '3.1K',
    awards: ['Webby Award Winner', 'Digital Innovation'],
    technologies: ['WebGL', 'Three.js', 'Interactive Design'],
    budget: '$850K',
    duration: '4 months',
    team: '25 people',
  },
];

const showcaseCategories = [
  {
    name: 'Film & Television',
    count: 245,
    icon: Video,
    description: 'Award-winning productions and innovative storytelling',
    featured: 'Stellar Awakening',
  },
  {
    name: 'Live Events',
    count: 189,
    icon: Calendar,
    description: 'Spectacular concerts, festivals, and corporate events',
    featured: 'Urban Rhythms',
  },
  {
    name: 'Digital & Interactive',
    count: 167,
    icon: Image,
    description: 'Cutting-edge digital experiences and campaigns',
    featured: 'Digital Frontier',
  },
  {
    name: 'Advertising',
    count: 134,
    icon: Eye,
    description: 'Creative campaigns that capture attention',
    featured: 'Brand Revolution',
  },
];

const communityStats = [
  { label: 'Projects Showcased', value: '1,247' },
  { label: 'Creative Professionals', value: '25K+' },
  { label: 'Awards Earned', value: '89' },
  { label: 'Industries Represented', value: '50+' },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Community Showcase"
          title="Creative Excellence On Display"
          highlight="On Display"
          description="Discover ambitious projects, award-winning achievements, and visionary work from our global network of 25,000+ creative professionals."
          actions={
            <>
              <Link href="/community/opportunities">
                <Button className="group">
                  Submit Your Project
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline">Browse Community</Button>
              </Link>
            </>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={communityStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Featured Projects"
          title="Award-Winning Stories From Our Creators"
          description="Handpicked productions that demonstrate category-defining craft, collaboration, and innovation."
        />

        <div className="mt-2xl grid gap-xl lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden rounded-3xl border border-border/40 bg-background/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-md left-md right-md flex items-center justify-between text-background/90">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                    {project.category}
                  </Badge>
                  <div className="flex items-center gap-md text-body-sm font-medium">
                    <span className="inline-flex items-center gap-xs">
                      <Eye className="h-icon-2xs w-icon-2xs" />
                      {project.views}
                    </span>
                    <span className="inline-flex items-center gap-xs">
                      <Heart className="h-icon-2xs w-icon-2xs" />
                      {project.likes}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-md left-md right-md text-background">
                  <h3 className="text-heading-4 uppercase leading-tight">{project.title}</h3>
                  <p className="text-body-sm text-background/80">
                    {project.creator} — {project.role}
                  </p>
                </div>
              </div>

              <CardContent className="space-y-xl p-xl">
                <p className="text-body color-muted leading-relaxed">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 gap-md text-body-sm">
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em] color-muted">Budget</span>
                    <span className="font-medium text-foreground">{project.budget}</span>
                  </div>
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em] color-muted">Duration</span>
                    <span className="font-medium text-foreground">{project.duration}</span>
                  </div>
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em] color-muted">Team Size</span>
                    <span className="font-medium text-foreground">{project.team}</span>
                  </div>
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em] color-muted">Technologies</span>
                    <span className="text-body-sm text-muted-foreground">{project.technologies.join(', ')}</span>
                  </div>
                </div>

                {project.awards.length > 0 && (
                  <div className="flex flex-wrap gap-xs">
                    {project.awards.map((award) => (
                      <Badge key={award} variant="outline" className="text-xs">
                        <Trophy className="mr-xs h-icon-2xs w-icon-2xs" />
                        {award}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-sm">
                  <Button className="flex-1" size="sm">
                    View Project
                    <ExternalLink className="ml-xs h-icon-2xs w-icon-2xs" />
                  </Button>
                  <Button size="sm" variant="outline">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Explore By Category"
          title="Inspiration Across Every Discipline"
          description="From cinematic universes to immersive campaigns, browse the showcase and discover creative excellence tailored to your focus."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {showcaseCategories.map((category) => {
            const Icon = category.icon;
            return (
              <MarketingCard
                key={category.name}
                title={category.name}
                description={`${category.description}. ${category.count.toLocaleString()} projects featured.`}
                icon={<Icon className="h-icon-md w-icon-md" />}
                footer={
                  <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                    <span>Spotlight: {category.featured}</span>
                    <Button variant="ghost" size="sm" className="px-sm">
                      View
                    </Button>
                  </div>
                }
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Community Recognition"
          title="Celebrating Impactful Creators"
          description="Quarterly honors that spotlight exceptional craftsmanship, consistent engagement, and breakthrough innovation across the GHXSTSHIP community."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          <MarketingCard
            title="Project of the Month"
            description="Curated by industry leaders and voted on by the community to highlight outstanding storytelling."
            icon={<Video className="h-icon-md w-icon-md" />}
            footer={<span className="font-medium text-foreground">12 winners this year</span>}
          />
          <MarketingCard
            title="Audience Favorite"
            description="Celebrating creators who foster vibrant community engagement and authentic collaboration."
            icon={<Calendar className="h-icon-md w-icon-md" />}
            footer={<span className="font-medium text-foreground">48K votes tallied</span>}
          />
          <MarketingCard
            title="Innovation Laurels"
            description="Recognizing teams that pioneer new techniques, sustainability practices, and technology-first workflows."
            icon={<Trophy className="h-icon-md w-icon-md" />}
            footer={<span className="font-medium text-foreground">34 awards granted</span>}
          />
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Share Your Next Breakthrough"
          description="Submit your most ambitious work to reach producers, partners, and brands searching for excellence."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/community/opportunities">
            <Button className="group">
              Submit Project
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline">Join the Community</Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
