import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Users, MapPin, Linkedin, Twitter, Github, Mail, Globe } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Our Team | GHXSTSHIP',
  description: 'Meet the talented team behind GHXSTSHIP. Discover the diverse group of professionals building the future of creative collaboration.',
  openGraph: {
    title: 'Our Team | GHXSTSHIP',
    description: 'Meet the talented team behind GHXSTSHIP. Discover the diverse group of professionals building the future of creative collaboration.',
    url: 'https://ghxstship.com/company/team',
  },
};

const leadership = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former creative director with 15+ years in advertising and film production. Led creative teams at top agencies before founding GHXSTSHIP.',
    location: 'San Francisco, CA',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://linkedin.com/in/alexchen',
      twitter: 'https://twitter.com/alexchen',
    },
  },
  {
    name: 'Sarah Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Technology leader with expertise in scalable platforms and AI integration. Previously led engineering at multiple successful startups.',
    location: 'Austin, TX',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://linkedin.com/in/sarahrodriguez',
      github: 'https://github.com/sarahrodriguez',
    },
  },
  {
    name: 'Marcus Kim',
    role: 'Head of Product',
    bio: 'Product strategist focused on user experience and creative workflow optimization. Former product lead at Adobe and Figma.',
    location: 'Seattle, WA',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://linkedin.com/in/marcuskim',
      twitter: 'https://twitter.com/marcuskim',
    },
  },
  {
    name: 'Emily Watson',
    role: 'VP of Engineering',
    bio: 'Engineering leader building robust, secure platforms for creative collaboration. Expert in distributed systems and cloud architecture.',
    location: 'New York, NY',
    image: '/api/placeholder/200/200',
    social: {
      linkedin: 'https://linkedin.com/in/emilywatson',
      github: 'https://github.com/emilywatson',
    },
  },
];

const departments = [
  {
    name: 'Engineering',
    count: 25,
    description: 'Building the platform that powers creative collaboration worldwide',
    leads: ['Emily Watson', 'David Park', 'Lisa Chen'],
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Product',
    count: 12,
    description: 'Designing user experiences that delight creative professionals',
    leads: ['Marcus Kim', 'Jennifer Liu', 'Alex Thompson'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Design',
    count: 8,
    description: 'Creating beautiful, intuitive interfaces for complex workflows',
    leads: ['Maria Gonzalez', 'James Wilson', 'Anna Park'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Sales & Marketing',
    count: 15,
    description: 'Connecting with creative professionals and growing our community',
    leads: ['Robert Chen', 'Sophie Davis', 'Michael Kim'],
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Customer Success',
    count: 10,
    description: 'Ensuring every customer achieves success with GHXSTSHIP',
    leads: ['Rachel Martinez', 'Tom Anderson', 'Maya Patel'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    name: 'Operations',
    count: 6,
    description: 'Supporting our team and scaling our global operations',
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
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              MEET THE
              <br />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                TEAM
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We're a diverse, global team of creators, builders, and innovators 
              united by our passion for empowering creative collaboration worldwide.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.metric} className="text-center">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>
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
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              LEADERSHIP TEAM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the experienced leaders guiding GHXSTSHIP's vision and growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {leadership.map((leader) => (
              <Card key={leader.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`${anton.className} text-xl font-bold mb-1 uppercase`}>
                        {leader.name}
                      </h3>
                      <p className="text-primary font-semibold mb-2">{leader.role}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-3 w-3" />
                        {leader.location}
                      </div>
                      <p className="text-muted-foreground mb-4">{leader.bio}</p>
                      
                      <div className="flex gap-2">
                        {leader.social.linkedin && (
                          <Button variant="outline" size="sm" className="p-2">
                            <Linkedin className="h-3 w-3" />
                          </Button>
                        )}
                        {leader.social.twitter && (
                          <Button variant="outline" size="sm" className="p-2">
                            <Twitter className="h-3 w-3" />
                          </Button>
                        )}
                        {leader.social.github && (
                          <Button variant="outline" size="sm" className="p-2">
                            <Github className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              OUR DEPARTMENTS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
                    <h3 className={`${anton.className} text-xl font-bold uppercase`}>
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
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              TEAM MEMBERS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
                  <h3 className={`${anton.className} text-lg font-bold mb-1 uppercase`}>
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
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              OUR CULTURE
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
                    <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase`}>
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
      <section className="py-20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              WANT TO JOIN US?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion 
              for empowering creative collaboration. Explore our open positions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/careers">
                <Button size="lg" className="w-full sm:w-auto group">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              LEARN MORE
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'About Us', href: '/company/about', description: 'Our mission, vision, and values' },
              { title: 'Careers', href: '/careers', description: 'Join our growing team' },
              { title: 'Press & Media', href: '/company/press', description: 'Latest news and coverage' },
            ].map((link) => (
              <a key={link.title} href={link.href}>
                <Card className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6 text-center">
                    <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase group-hover:text-primary transition-colors`}>
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
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

// Import missing icons
import { TrendingUp, Heart, Shield, Target } from 'lucide-react';
