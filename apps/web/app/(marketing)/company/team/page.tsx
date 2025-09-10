import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Mail, Globe, Users, TrendingUp, Heart, Shield, Target, MapPin, Linkedin } from 'lucide-react';
import { typography } from '../../lib/typography';
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
    bio: 'Julian founded GHXSTSHIP because he genuinely believed production management could be less painful. Wild concept, right? He\'s been building creative platforms and leading teams for over a decade, turning "that\'ll never work" into "okay, that actually works."',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/julianrclarkson/',
    },
  },
  {
    name: 'Sarah Fry',
    role: 'VP, Production',
    bio: 'Sarah has this superpower where she can look at complete production chaos and somehow see the organized workflow hiding underneath. She\'s been wrangling creative projects for years, and honestly, she makes it look way too easy.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/frysarah8/',
    },
  },
  {
    name: 'John Macejak',
    role: 'VP, Operations',
    bio: 'John is the person who actually reads the terms and conditions. He keeps our operations running so smoothly that things just... work. Which is honestly kind of suspicious, but we\'re not complaining.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/john-macejak-582946168/',
    },
  },
  {
    name: 'Vita Sotakoun',
    role: 'VP, Hospitality',
    bio: 'Vita has mastered the art of making everyone feel welcome, even the clients who show up with "just a few small changes" to a project that\'s already live. She genuinely enjoys hospitality, which is both impressive and slightly concerning.',
    location: 'Global',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://www.linkedin.com/in/vida-sotakoun/',
    },
  },
];

const departments = [
  {
    name: 'Engineering',
    count: 25,
    description: 'Building tools that don\'t break when you actually need them',
    leads: ['Emily Watson', 'David Park', 'Lisa Chen'],
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Product',
    count: 12,
    description: 'Making complex workflows feel less like rocket science',
    leads: ['Marcus Kim', 'Jennifer Liu', 'Alex Thompson'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Design',
    count: 8,
    description: 'Making production management look good (and actually work)',
    leads: ['Maria Gonzalez', 'James Wilson', 'Anna Park'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Sales & Marketing',
    count: 15,
    description: 'Spreading the word without being annoying about it',
    leads: ['Robert Chen', 'Sophie Davis', 'Michael Kim'],
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Customer Success',
    count: 10,
    description: 'Making sure our tools actually solve your problems',
    leads: ['Rachel Martinez', 'Tom Anderson', 'Maya Patel'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    name: 'Operations',
    count: 6,
    description: 'Keeping the lights on and the coffee flowing',
    leads: ['Chris Johnson', 'Elena Rodriguez', 'Sam Taylor'],
    color: 'from-green-500 to-emerald-500',
  },
];

const teamMembers = [
  {
    name: 'David Park',
    role: 'Senior Engineering Manager',
    department: 'Engineering',
    location: 'Vancouver, Canada',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Lisa Chen',
    role: 'Principal Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Jennifer Liu',
    role: 'Senior Product Manager',
    department: 'Product',
    location: 'Los Angeles, CA',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Alex Thompson',
    role: 'Product Designer',
    department: 'Product',
    location: 'Portland, OR',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Maria Gonzalez',
    role: 'Design Director',
    department: 'Design',
    location: 'Barcelona, Spain',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'James Wilson',
    role: 'Senior UX Designer',
    department: 'Design',
    location: 'London, UK',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Robert Chen',
    role: 'VP of Sales',
    department: 'Sales & Marketing',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Sophie Davis',
    role: 'Head of Marketing',
    department: 'Sales & Marketing',
    location: 'Chicago, IL',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Rachel Martinez',
    role: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Miami, FL',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Tom Anderson',
    role: 'Senior Customer Success Manager',
    department: 'Customer Success',
    location: 'Denver, CO',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Chris Johnson',
    role: 'Head of Operations',
    department: 'Operations',
    location: 'Austin, TX',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Elena Rodriguez',
    role: 'People Operations Manager',
    department: 'Operations',
    location: 'Mexico City, Mexico',
    image: '/api/placeholder/150/150',
  },
];

const stats = [
  { metric: '76', label: 'Team Members', description: 'Across 6 departments' },
  { metric: '15+', label: 'Countries', description: 'Global distributed team' },
  { metric: '25+', label: 'Languages', description: 'Spoken by our team' },
  { metric: '100%', label: 'Remote-First', description: 'Flexible work culture' },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Our People
            </Badge>
            <h1 className={`${typography.heroTitle} mb-6`}>
              MEET THE<br /><span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">TEAM</span>
            </h1>
            <p className={`${typography.heroSubtitle} mb-8`}>
              We're a diverse, global team of creators, builders, and innovators united by our passion for empowering creative collaboration worldwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.metric} className="text-center">
                  <div className={`${typography.statValue} mb-2`}>
                    {stat.metric}
                  </div>
                  <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${typography.sectionTitle} mb-6`}>
              LEADERSHIP TEAM
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              Meet the experienced leaders guiding GHXSTSHIP's vision and growth.
            </p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {leadership.map((leader) => (
            <Card key={leader.name} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${typography.cardTitle} text-lg`}>{leader.name}</h3>
                    <p className="text-sm text-muted-foreground">{leader.role}</p>
                  </div>
                  {leader.social?.linkedin && (
                    <a href={leader.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {leader.location}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{leader.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${typography.sectionTitle} mb-6`}>
              OUR DEPARTMENTS
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              Each department brings unique expertise to building the future of creative collaboration.
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <Card key={dept.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${dept.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`${typography.cardTitle} text-xl`}>
                    {dept.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {dept.count} members
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">{dept.description}</p>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Team Leads</h4>
                  <div className="space-y-1">
                    {dept.leads.map((lead) => (
                      <div key={lead} className="text-sm text-foreground">{lead}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${typography.sectionTitle} mb-6`}>
              TEAM MEMBERS
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              Get to know some of the talented individuals who make GHXSTSHIP possible.
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.name} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className={`${typography.cardTitle} text-lg mb-1`}>
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-primary mb-1">{member.role}</p>
                <Badge variant="outline" className="text-xs mb-3">
                  {member.department}
                </Badge>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {member.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            And many more talented individuals across all departments!
          </p>
          <Link href="/careers">
            <Button className="group">
              Join Our Team
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${typography.sectionTitle} mb-6`}>
              OUR CULTURE
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              We've built a culture that celebrates creativity, embraces diversity, and empowers every team member to do their best work.
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <Card key={value.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`${typography.cardTitle} mb-3`}>
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
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${typography.sectionTitle} mb-6`}>
              WANT TO JOIN US?
            </h2>
            <p className={`${typography.sectionSubtitle}`}>
              We're always looking for talented individuals who share our passion for empowering creative collaboration. Explore our open positions.
            </p>
          </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/careers">
            <Button className="w-full sm:w-auto group">
              View Open Positions
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button className="w-full sm:w-auto">
            <Mail className="mr-2 h-4 w-4" />
            Contact Us
          </Button>
        </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${typography.sectionTitle} mb-6`}>
              LEARN MORE
            </h2>
          </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'About Us', href: '/company/about', description: 'Our mission, vision, and values' },
            { title: 'Careers', href: '/careers', description: 'Join our growing team' },
            { title: 'Press & Media', href: '/company/press', description: 'Latest news and coverage' },
          ].map((link) => (
            <Link key={link.title} href={link.href as any}>
              <Card className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6 text-center">
                  <h3 className={`${typography.cardTitle} text-lg mb-2 group-hover:text-primary transition-colors`}>
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

