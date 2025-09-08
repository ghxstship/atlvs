import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Users, Target, Globe, Award, TrendingUp, Heart, Zap, Shield } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'About Us | GHXSTSHIP',
  description: 'Learn about GHXSTSHIP\'s mission to revolutionize creative collaboration. Discover our story, values, and commitment to empowering creative professionals worldwide.',
  openGraph: {
    title: 'About Us | GHXSTSHIP',
    description: 'Learn about GHXSTSHIP\'s mission to revolutionize creative collaboration. Discover our story, values, and commitment to empowering creative professionals worldwide.',
    url: 'https://ghxstship.com/company/about',
  },
};

const values = [
  {
    icon: Heart,
    title: 'Creative First',
    description: 'We put creativity at the center of everything we do, building tools that enhance rather than constrain creative expression.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'We believe the best creative work happens when diverse talents from around the world can collaborate seamlessly.',
  },
  {
    icon: Zap,
    title: 'Innovation Drive',
    description: 'We continuously push the boundaries of what\'s possible in creative collaboration and project management.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'We maintain the highest standards of security and reliability to protect our users\' creative assets and data.',
  },
];

const milestones = [
  {
    year: '2020',
    title: 'Foundation',
    description: 'GHXSTSHIP founded with a vision to revolutionize creative collaboration',
  },
  {
    year: '2021',
    title: 'First 1,000 Users',
    description: 'Reached our first milestone of 1,000 creative professionals on the platform',
  },
  {
    year: '2022',
    title: 'Global Expansion',
    description: 'Expanded operations to serve creative teams across 50+ countries',
  },
  {
    year: '2023',
    title: 'Enterprise Launch',
    description: 'Launched enterprise solutions serving Fortune 500 companies',
  },
  {
    year: '2024',
    title: 'AI Integration',
    description: 'Introduced AI-powered features to enhance creative workflows',
  },
];

const stats = [
  { metric: '100K+', label: 'Creative Professionals', description: 'Trust GHXSTSHIP for their projects' },
  { metric: '50+', label: 'Countries Served', description: 'Global reach and impact' },
  { metric: '1M+', label: 'Projects Completed', description: 'Successful creative collaborations' },
  { metric: '99.9%', label: 'Uptime SLA', description: 'Reliable platform performance' },
];

const leadership = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former creative director with 15+ years in advertising and film production.',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Sarah Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Technology leader with expertise in scalable platforms and AI integration.',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Marcus Kim',
    role: 'Head of Product',
    bio: 'Product strategist focused on user experience and creative workflow optimization.',
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Emily Watson',
    role: 'VP of Engineering',
    bio: 'Engineering leader building robust, secure platforms for creative collaboration.',
    image: '/api/placeholder/150/150',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Our Story
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              EMPOWERING
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                CREATIVE
              </span>
              <br />
              COLLABORATION
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              At GHXSTSHIP, we believe that the future of creativity lies in seamless 
              collaboration. We're building the platform that connects creative minds 
              across the globe, breaking down barriers and enabling extraordinary work.
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

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
                OUR MISSION
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                To democratize access to creative talent and enable seamless collaboration 
                between creative professionals worldwide. We're breaking down geographical 
                barriers and creating opportunities for extraordinary creative work to happen 
                anywhere, anytime.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Connect Global Talent</h3>
                    <p className="text-sm text-muted-foreground">Bridge the gap between creative professionals and opportunities worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Enable Seamless Collaboration</h3>
                    <p className="text-sm text-muted-foreground">Provide tools that make remote creative work as effective as in-person collaboration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Drive Industry Innovation</h3>
                    <p className="text-sm text-muted-foreground">Push the boundaries of what's possible in creative project management</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-0">
                <CardContent className="p-8">
                  <h3 className={`${anton.className} text-2xl font-bold mb-4 uppercase`}>Our Vision</h3>
                  <p className="text-muted-foreground mb-6">
                    A world where creativity knows no boundaries. Where the best ideas can come 
                    from anywhere and be brought to life through seamless global collaboration.
                  </p>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
                    "We envision a future where every creative professional has access to the 
                    tools, talent, and opportunities they need to create their best work."
                  </blockquote>
                  <cite className="text-sm text-muted-foreground mt-2 block">— Alex Chen, CEO & Co-Founder</cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              OUR VALUES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              These core values guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-xl font-bold mb-3 uppercase`}>{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              OUR JOURNEY
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From a small startup to a global platform serving creative professionals worldwide.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className={`${anton.className} text-2xl font-bold text-primary mb-2 uppercase`}>
                          {milestone.year}
                        </div>
                        <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase`}>
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                  </div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              LEADERSHIP TEAM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the experienced leaders driving GHXSTSHIP's vision and growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader) => (
              <Card key={leader.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className={`${anton.className} text-lg font-bold mb-1 uppercase`}>
                    {leader.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary mb-3">{leader.role}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              AWARDS & RECOGNITION
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Industry recognition for our innovation and impact in creative collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Best Creative Platform 2024',
                organization: 'Creative Industry Awards',
                description: 'Recognized for innovation in creative collaboration tools',
              },
              {
                title: 'Top 50 SaaS Companies',
                organization: 'TechCrunch',
                description: 'Featured among the most promising SaaS startups',
              },
              {
                title: 'Innovation in Remote Work',
                organization: 'Remote Work Association',
                description: 'Awarded for advancing remote creative collaboration',
              },
              {
                title: 'Customer Choice Award',
                organization: 'G2 Reviews',
                description: 'Highest customer satisfaction in project management',
              },
              {
                title: 'Fast Company Most Innovative',
                organization: 'Fast Company',
                description: 'Listed among most innovative companies in design',
              },
              {
                title: 'Enterprise Solution of the Year',
                organization: 'SaaS Awards',
                description: 'Best enterprise creative management platform',
              },
            ].map((award) => (
              <Card key={award.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase`}>
                    {award.title}
                  </h3>
                  <p className="text-sm font-semibold text-primary mb-2">{award.organization}</p>
                  <p className="text-sm text-muted-foreground">{award.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              JOIN OUR MISSION
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the creative revolution. Join thousands of professionals 
              who are already transforming how creative work gets done.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join Our Team
                </Button>
              </Link>
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
              { title: 'Our Team', href: '/company/team', description: 'Meet the people behind GHXSTSHIP' },
              { title: 'Press & Media', href: '/company/press', description: 'Latest news and press coverage' },
              { title: 'Careers', href: '/careers', description: 'Join our growing team' },
            ].map((link) => (
              <Link key={link.title} href={link.href}>
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
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
