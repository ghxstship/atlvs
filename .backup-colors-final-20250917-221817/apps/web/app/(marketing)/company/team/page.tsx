import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Mail, Globe, Users, TrendingUp, Heart, Shield, Target, MapPin, Linkedin } from 'lucide-react';
import { typography } from '../../../_components/lib/typography';
// import { Section, SectionHeader } from '../../components/layout/Section';
// import { TeamMemberCard } from '../../components/team/TeamMemberCard';
// import { LeadershipCard } from '../../components/team/LeadershipCard';
// import { DepartmentCard } from '../../components/team/DepartmentCard';
// import { TeamStats } from '../../components/team/TeamStats';
// import { FeatureCard } from '../../components/ui/FeatureCard';

export const metadata: Metadata = {
  title: 'Our Team - People Who Actually Get It | GHXSTSHIP',
  description: 'Meet the team that survived Formula 1 chaos and festival meltdowns. We build production tools because we\'ve lived the pain.',
  openGraph: {
    title: 'Our Team - People Who Actually Get It | GHXSTSHIP',
    description: 'Meet the team that survived Formula 1 chaos and festival meltdowns.',
    url: 'https://ghxstship.com/company/team',
  },
};

const leadership = [
  {
    name: 'Julian Clarkson',
    role: 'Founder, CXO',
    bio: 'Julian\'s been navigating the entertainment seas across 52 countries and 6 continents, collecting production war stories like they\'re going out of style. He founded GHXSTSHIP because apparently someone had to fix this industry\'s chaos—and honestly, who else was gonna do it?',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/julianrclarkson/',
    },
  },
  {
    name: 'Sarah Fry',
    role: 'VP, Production',
    bio: 'Sarah\'s the captain who can steer any production ship through the stormiest deadlines. She\'s got this uncanny ability to turn "we\'re totally screwed" into "actually, we\'re ahead of schedule"—which is basically witchcraft at this point.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/frysarah8/',
    },
  },
  {
    name: 'John Macejak',
    role: 'VP, Operations',
    bio: 'John\'s the guy who keeps our operational ship sailing smooth while everyone else is running around like it\'s their first day. He makes complex logistics look easy, which is either impressive or mildly terrifying—jury\'s still out.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/john-macejak-582946168/',
    },
  },
  {
    name: 'Vita Sotakoun',
    role: 'VP, Hospitality',
    bio: 'Vita\'s mastered the ancient art of making everyone feel like VIPs, even when they\'re being absolutely impossible. She can turn a disaster into a five-star experience faster than you can say "client emergency"—it\'s honestly kind of magical.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/vida-sotakoun/',
    },
  },
  {
    name: 'Kayla Harvy',
    role: 'Director, Business Development',
    bio: 'Kayla\'s got this talent for spotting opportunities that others miss entirely. She builds relationships like she\'s collecting rare trading cards—strategically, enthusiastically, and with an impressive success rate that makes the rest of us look bad.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/kayla-harvey-731b8a34/',
    },
  },
  {
    name: 'Dallas D-Cal Calles',
    role: 'Director, Talent & Entertainment',
    bio: 'Dallas navigates the talent waters like a seasoned admiral, connecting the right people to the right opportunities. He\'s got an eye for talent that\'s honestly a little scary—in the best possible way, obviously.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/dallascalles/',
    },
  },
];

const departments = [
  {
    code: 'XLA',
    name: 'Executive Leadership & Administration',
    count: 8,
    description: 'Steering the ship and keeping everyone pointed toward the same horizon',
    leads: ['Julian Clarkson', 'Sarah Fry', 'John Macejak'],
    color: 'from-primary to-accent',
  },
  {
    code: 'FPL',
    name: 'Finance, Procurement & Legal Services',
    count: 12,
    description: 'Making sure the money flows right and the contracts actually protect us',
    leads: ['Marcus Chen', 'Lisa Rodriguez', 'David Kim'],
    color: 'from-primary to-accent',
  },
  {
    code: 'CDS',
    name: 'Creative Design & Strategy',
    count: 15,
    description: 'Turning wild ideas into experiences that actually make sense',
    leads: ['Maya Patel', 'Alex Thompson', 'Sofia Martinez'],
    color: 'from-primary to-accent',
  },
  {
    code: 'EPR',
    name: 'Event Programming & Revenue',
    count: 18,
    description: 'Crafting experiences that people remember and pay for',
    leads: ['Jordan Lee', 'Emma Wilson', 'Carlos Ruiz'],
    color: 'from-primary to-accent',
  },
  {
    code: 'MMM',
    name: 'Marketing & Media Management',
    count: 14,
    description: 'Getting the word out without being that annoying brand',
    leads: ['Taylor Swift', 'Ryan Park', 'Zoe Chen'],
    color: 'from-primary to-accent',
  },
  {
    code: 'SED',
    name: 'Site & Environmental Development',
    count: 22,
    description: 'Building spaces that don\'t fall down and actually work for humans',
    leads: ['Mike Johnson', 'Anna Garcia', 'Tom Anderson'],
    color: 'from-primary to-accent',
  },
  {
    code: 'SOL',
    name: 'Site Operations & Logistics',
    count: 28,
    description: 'Moving mountains of stuff to the right place at the right time',
    leads: ['Rachel Kim', 'James Wilson', 'Maria Santos'],
    color: 'from-primary to-accent',
  },
  {
    code: 'ITC',
    name: 'IT & Communications',
    count: 16,
    description: 'Keeping the digital world connected when everything wants to break',
    leads: ['Kevin Zhang', 'Priya Sharma', 'Lucas Brown'],
    color: 'from-primary to-accent',
  },
  {
    code: 'XTP',
    name: 'Experiential & Technical Production',
    count: 35,
    description: 'Making the impossible look effortless, one technical miracle at a time',
    leads: ['Diana Ross', 'Marcus Johnson', 'Elena Rodriguez'],
    color: 'from-primary to-accent',
  },
  {
    code: 'BGS',
    name: 'Branding, Graphics & Signage',
    count: 11,
    description: 'Making everything look intentional, even when it definitely wasn\'t',
    leads: ['Chris Lee', 'Samantha Davis', 'Roberto Martinez'],
    color: 'from-primary to-accent',
  },
  {
    code: 'PSS',
    name: 'Public Safety & Security',
    count: 24,
    description: 'Keeping everyone safe while they\'re having way too much fun',
    leads: ['Officer Johnson', 'Captain Smith', 'Sergeant Williams'],
    color: 'from-primary to-accent',
  },
  {
    code: 'GSX',
    name: 'Guest Services & Experience',
    count: 19,
    description: 'Turning confused visitors into raving fans, one interaction at a time',
    leads: ['Isabella Chen', 'Noah Thompson', 'Ava Rodriguez'],
    color: 'from-primary to-accent',
  },
  {
    code: 'HFB',
    name: 'Hospitality, Food & Beverage',
    count: 32,
    description: 'Feeding people and keeping them happy, which is basically magic',
    leads: ['Vita Sotakoun', 'Chef Martinez', 'Sommelier Kim'],
    color: 'from-primary to-accent',
  },
  {
    code: 'ENT',
    name: 'Entertainment, Talent',
    count: 21,
    description: 'Wrangling creative personalities and making sure the show goes on',
    leads: ['Dallas D-Cal Calles', 'Melody Johnson', 'Rhythm Davis'],
    color: 'from-primary to-accent',
  },
  {
    code: 'TDX',
    name: 'Travel, Destinations, & Experiences',
    count: 13,
    description: 'Getting people places and making sure they actually want to be there',
    leads: ['Journey Smith', 'Atlas Brown', 'Compass Wilson'],
    color: 'from-primary to-accent',
  },
];

const teamMembers = [
  {
    name: 'Alexandra Sterling',
    role: 'Executive Operations Director',
    department: 'XLA',
    departmentCode: 'XLA',
    location: 'Global',
    image: '/api/placeholder/150/150',
    tagline: 'Turns executive chaos into strategic clarity—because someone has to keep the C-suite focused',
    profile: 'Alex translates big-picture vision into actionable plans that actually work. She\'s the reason leadership meetings end with decisions instead of more meetings.',
  },
  {
    name: 'Marcus Chen',
    role: 'Senior Financial Analyst',
    department: 'FPL',
    departmentCode: 'FPL',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    tagline: 'Makes budgets that survive contact with reality—and lawyers who actually read contracts',
    profile: 'Marcus has this weird talent for making numbers tell stories that make sense. He can spot a budget red flag from three spreadsheets away.',
  },
  {
    name: 'Luna Rodriguez',
    role: 'Creative Strategy Lead',
    department: 'CDS',
    departmentCode: 'CDS',
    location: 'Los Angeles, CA',
    image: '/api/placeholder/150/150',
    tagline: 'Transforms "wouldn\'t it be cool if..." into experiences people actually want to attend',
    profile: 'Luna bridges the gap between wild creative dreams and practical execution. She\'s fluent in both artist-speak and project manager-speak.',
  },
  {
    name: 'Jordan Kim',
    role: 'Programming Manager',
    department: 'EPR',
    departmentCode: 'EPR',
    location: 'Nashville, TN',
    image: '/api/placeholder/150/150',
    tagline: 'Curates lineups that sell tickets and creates moments people post about for years',
    profile: 'Jordan has an uncanny ability to spot what audiences want before they know they want it. His programming decisions consistently drive revenue.',
  },
  {
    name: 'Zoe Thompson',
    role: 'Digital Marketing Strategist',
    department: 'MMM',
    departmentCode: 'MMM',
    location: 'Austin, TX',
    image: '/api/placeholder/150/150',
    tagline: 'Builds buzz that converts to ticket sales—without being cringe about it',
    profile: 'Zoe creates marketing campaigns that feel authentic instead of desperate. She understands the difference between viral and valuable.',
  },
  {
    name: 'River Martinez',
    role: 'Site Development Manager',
    department: 'SED',
    departmentCode: 'SED',
    location: 'Denver, CO',
    image: '/api/placeholder/150/150',
    tagline: 'Builds festival grounds that don\'t flood, collapse, or become mud pits of despair',
    profile: 'River turns empty fields into functional event spaces. He thinks about drainage, power distribution, and crowd flow so you don\'t have to.',
  },
  {
    name: 'Casey Wilson',
    role: 'Logistics Coordinator',
    department: 'SOL',
    departmentCode: 'SOL',
    location: 'Chicago, IL',
    image: '/api/placeholder/150/150',
    tagline: 'Gets 50,000 people fed, watered, and happy without anyone noticing the complexity',
    profile: 'Casey orchestrates the invisible ballet of event logistics. When everything runs smoothly, that\'s Casey\'s handiwork.',
  },
  {
    name: 'Phoenix Zhang',
    role: 'IT Systems Manager',
    department: 'ITC',
    departmentCode: 'ITC',
    location: 'Seattle, WA',
    image: '/api/placeholder/150/150',
    tagline: 'Keeps WiFi working when 100k people are trying to post the same sunset photo',
    profile: 'Phoenix designs network infrastructure that survives the social media apocalypse. He plans for the worst-case scenario and then adds more bandwidth.',
  },
  {
    name: 'Sage Anderson',
    role: 'Technical Production Lead',
    department: 'XTP',
    departmentCode: 'XTP',
    location: 'Las Vegas, NV',
    image: '/api/placeholder/150/150',
    tagline: 'Makes stages that don\'t collapse and sound systems that actually work in the back row',
    profile: 'Sage turns technical riders into reality. She speaks fluent audio engineer and can troubleshoot anything with a power cord.',
  },
  {
    name: 'Indigo Davis',
    role: 'Brand Design Manager',
    department: 'BGS',
    departmentCode: 'BGS',
    location: 'Portland, OR',
    image: '/api/placeholder/150/150',
    tagline: 'Creates signage so good people actually know where they\'re going',
    profile: 'Indigo designs wayfinding that works even when people are distracted, tired, or slightly intoxicated. Her signs prevent crowd disasters.',
  },
  {
    name: 'Atlas Johnson',
    role: 'Security Operations Manager',
    department: 'PSS',
    departmentCode: 'PSS',
    location: 'Miami, FL',
    image: '/api/placeholder/150/150',
    tagline: 'Keeps everyone safe while maintaining the vibe—no easy feat with 50k party people',
    profile: 'Atlas balances security with accessibility. He prevents problems before they happen while keeping the atmosphere fun, not fortress-like.',
  },
  {
    name: 'Harmony Lee',
    role: 'Guest Experience Manager',
    department: 'GSX',
    departmentCode: 'GSX',
    location: 'San Francisco, CA',
    image: '/api/placeholder/150/150',
    tagline: 'Turns first-time visitors into lifelong fans through moments that matter',
    profile: 'Harmony designs touchpoints that create emotional connections. She understands that great experiences happen in the details.',
  },
  {
    name: 'Basil Rodriguez',
    role: 'Hospitality Operations Lead',
    department: 'HFB',
    departmentCode: 'HFB',
    location: 'New Orleans, LA',
    image: '/api/placeholder/150/150',
    tagline: 'Feeds thousands without food poisoning—and makes it taste good too',
    profile: 'Basil manages complex food operations that scale. He knows how to keep quality high when quantity gets ridiculous.',
  },
  {
    name: 'Melody Santos',
    role: 'Talent Relations Manager',
    department: 'ENT',
    departmentCode: 'ENT',
    location: 'Los Angeles, CA',
    image: '/api/placeholder/150/150',
    tagline: 'Keeps artists happy, on time, and actually showing up to their own performances',
    profile: 'Melody speaks fluent artist temperament. She manages egos, riders, and last-minute changes with diplomatic grace.',
  },
  {
    name: 'Journey Park',
    role: 'Travel Experience Coordinator',
    department: 'TDX',
    departmentCode: 'TDX',
    location: 'Vancouver, Canada',
    image: '/api/placeholder/150/150',
    tagline: 'Gets people to events without losing their luggage, sanity, or enthusiasm',
    profile: 'Journey creates travel experiences that enhance rather than exhaust. She turns logistics into part of the adventure.',
  },
];

const stats = [
  { metric: '318', label: 'Team Members', description: 'Across 15 departments' },
  { metric: '25+', label: 'Countries', description: 'Global distributed team' },
  { metric: '40+', label: 'Languages', description: 'Spoken by our team' },
  { metric: '100%', label: 'Remote-First', description: 'Flexible work culture' },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Our People
            </Badge>
            <h1 className={`${typography.heroTitle} mb-lg`}>
              MEET THE<br /><span className="text-gradient-primary">TEAM</span>
            </h1>
            <p className={`${typography.heroSubtitle} mb-xl`}>
              We're a diverse, global team of creators, builders, and innovators united by our passion for empowering creative collaboration worldwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-lg max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.metric} className="text-center">
                  <div className={`${typography.statValue} mb-sm`}>
                    {stat.metric}
                  </div>
                  <div className="font-semibold text-foreground mb-xs">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${typography.sectionTitle} mb-lg`}>
              LEADERSHIP TEAM
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              Meet the experienced leaders guiding GHXSTSHIP's vision and growth.
            </p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl max-w-7xl mx-auto">
          {leadership.map((leader) => (
            <Card key={leader.name} className="group hover:shadow-floating transition-all duration-300 h-[320px] flex flex-col">
              <CardContent className="p-lg flex flex-col h-full">
                {/* Header Section - Fixed Height */}
                <div className="flex items-center cluster mb-md h-12">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`${typography.cardTitle} text-lg truncate`}>{leader.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{leader.role}</p>
                  </div>
                  {leader.social?.linkedin && (
                    <a href={leader.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
                
                {/* Content Section - Flexible Height with Scroll */}
                <div className="flex-1 mb-md overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <p className="text-sm text-muted-foreground">{leader.bio}</p>
                  </div>
                </div>
                
                {/* Footer Section - Fixed Height */}
                <div className="flex items-center text-sm text-muted-foreground h-4">
                  <MapPin className="w-4 h-4 mr-xs flex-shrink-0" />
                  <span className="truncate">{leader.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-4xl bg-muted">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${typography.sectionTitle} mb-lg`}>
              OUR DEPARTMENTS
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              Each department brings unique expertise to building the future of creative collaboration.
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
          {departments.map((dept) => (
            <Card key={dept.name} className="hover:shadow-floating transition-shadow h-[200px] flex flex-col">
              <CardContent className="p-lg flex flex-col h-full">
                {/* Header Section - Fixed Height */}
                <div className="flex items-center gap-md mb-md h-12">
                  <div className={`w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Users className="h-6 w-6 text-background" />
                  </div>
                  <h3 className={`${typography.cardTitle} text-lg flex-1 min-w-0`}>
                    {dept.name}
                  </h3>
                </div>
                
                {/* Content Section - Flexible Height with Scroll */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <p className="text-muted-foreground text-sm">{dept.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${typography.sectionTitle} mb-lg`}>
              TEAM MEMBERS
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              Get to know some of the talented individuals who make GHXSTSHIP possible.
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
          {teamMembers.map((member) => (
            <Card key={member.name} className="hover:shadow-floating transition-all duration-300 group h-[400px] flex flex-col">
              <CardContent className="p-lg flex flex-col h-full">
                {/* Header Section - Fixed Height */}
                <div className="flex items-center cluster mb-md h-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`${typography.cardTitle} text-lg mb-xs truncate`}>
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary mb-xs truncate">{member.role}</p>
                    <Badge variant="outline" className="text-xs">
                      {member.departmentCode}
                    </Badge>
                  </div>
                </div>
                
                {/* Content Section - Flexible Height with Scroll */}
                <div className="flex-1 mb-md overflow-hidden">
                  <p className="text-sm font-medium text-foreground mb-sm italic line-clamp-2">
                    "{member.tagline}"
                  </p>
                  <div className="h-20 overflow-y-auto">
                    <p className="text-sm text-muted-foreground">
                      {member.profile}
                    </p>
                  </div>
                </div>
                
                {/* Footer Section - Fixed Height */}
                <div className="flex items-center gap-xs text-xs text-muted-foreground h-4">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{member.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-2xl">
          <p className="text-muted-foreground mb-lg">
            And many more talented individuals across all departments!
          </p>
          <Link href="/careers">
            <Button className="group">
              Join Our Team
              <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-4xl bg-muted">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${typography.sectionTitle} mb-lg`}>
              OUR CULTURE
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              We've built a culture that celebrates creativity, embraces diversity, and empowers every team member to do their best work.
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
          {[
            {
              title: 'Remote-First',
              description: 'We believe great work can happen anywhere. Our team spans the globe, working flexibly while staying connected.',
              icon: Globe,
            },
            {
              title: 'Creative Freedom',
              description: 'We encourage experimentation, creative thinking, and innovative approaches to solving complex problems.',
              icon: Users,
            },
            {
              title: 'Continuous Learning',
              description: 'We invest in our team\'s growth through learning opportunities, conferences, and skill development programs.',
              icon: TrendingUp,
            },
            {
              title: 'Inclusive Environment',
              description: 'We celebrate diverse perspectives and create an environment where everyone feels valued and heard.',
              icon: Heart,
            },
            {
              title: 'Work-Life Balance',
              description: 'We respect personal time and promote healthy boundaries between work and life.',
              icon: Shield,
            },
            {
              title: 'Impact-Driven',
              description: 'Every team member contributes to meaningful work that impacts creative professionals worldwide.',
              icon: Target,
            },
          ].map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-md">
                    <Icon className="h-6 w-6 text-background" />
                  </div>
                  <h3 className={`${typography.cardTitle} mb-sm`}>
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-primary text-primary-foreground">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${typography.sectionTitle} mb-lg`}>
              WANT TO JOIN US?
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              We're always looking for talented individuals who share our passion for empowering creative collaboration. Explore our open positions.
            </p>
          </div>
        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Link href="/careers">
            <Button className="w-full sm:w-auto group">
              View Open Positions
              <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button className="w-full sm:w-auto">
            <Mail className="mr-sm h-4 w-4" />
            Contact Us
          </Button>
        </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${typography.sectionTitle} mb-lg`}>
              LEARN MORE
            </h2>
          </div>
        <div className="grid md:grid-cols-3 gap-lg">
          {[
            { title: 'About Us', href: '/company/about', description: 'Our mission, vision, and values' },
            { title: 'Careers', href: '/careers', description: 'Join our growing team' },
            { title: 'Press & Media', href: '/company/press', description: 'Latest news and coverage' },
          ].map((link) => (
            <Link key={link.title} href={link.href as any}>
              <Card className="hover:shadow-floating transition-shadow group">
                <CardContent className="p-lg text-center">
                  <h3 className={`${typography.cardTitle} text-lg mb-sm group-hover:text-primary transition-colors`}>
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
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
