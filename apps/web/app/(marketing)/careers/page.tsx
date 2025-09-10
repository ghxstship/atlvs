import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, MapPin, Clock, Users, Heart, Zap, Globe, Coffee, Briefcase, GraduationCap, DollarSign, Calendar } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Careers - Join Our Mission | GHXSTSHIP',
  description: 'Join GHXSTSHIP and help build the future of creative production management. Explore open positions and learn about our culture.',
  openGraph: {
    title: 'Careers - Join Our Mission | GHXSTSHIP',
    description: 'Join GHXSTSHIP and help build the future of creative production management. Explore open positions and learn about our culture.',
    url: 'https://ghxstship.com/careers',
  },
};

const openPositions = [
  {
    id: 'senior-frontend-engineer',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Build beautiful, performant user interfaces for our production management platform.',
    requirements: ['5+ years React/TypeScript experience', 'Experience with design systems', 'Performance optimization expertise'],
    salary: '$150k - $200k',
    posted: '2 days ago',
  },
  {
    id: 'product-manager',
    title: 'Senior Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Drive product strategy and roadmap for our creative workflow solutions.',
    requirements: ['5+ years product management', 'B2B SaaS experience', 'Creative industry knowledge preferred'],
    salary: '$140k - $180k',
    posted: '1 week ago',
  },
  {
    id: 'backend-engineer',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Build scalable APIs and infrastructure for our production management platform.',
    requirements: ['3+ years backend development', 'Node.js/Python experience', 'Database design skills'],
    salary: '$120k - $160k',
    posted: '3 days ago',
  },
  {
    id: 'ux-designer',
    title: 'Senior UX Designer',
    department: 'Design',
    location: 'London, UK',
    type: 'Full-time',
    remote: true,
    description: 'Design intuitive experiences for creative professionals worldwide.',
    requirements: ['5+ years UX design', 'B2B software experience', 'Design systems expertise'],
    salary: '£70k - £90k',
    posted: '5 days ago',
  },
  {
    id: 'customer-success',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Help our customers achieve success with our production management tools.',
    requirements: ['3+ years customer success', 'SaaS experience', 'Excellent communication skills'],
    salary: '$90k - $120k',
    posted: '1 week ago',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Singapore',
    type: 'Full-time',
    remote: false,
    description: 'Build and maintain our cloud infrastructure and deployment pipelines.',
    requirements: ['4+ years DevOps experience', 'AWS/GCP expertise', 'Kubernetes knowledge'],
    salary: 'S$80k - S$120k',
    posted: '4 days ago',
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance plus wellness stipend.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Compensation',
    description: 'Market-leading salaries plus equity in a fast-growing company.',
  },
  {
    icon: Globe,
    title: 'Remote-First Culture',
    description: 'Work from anywhere with flexible hours and async collaboration.',
  },
  {
    icon: GraduationCap,
    title: 'Learning & Development',
    description: '$2,000 annual learning budget plus conference attendance.',
  },
  {
    icon: Calendar,
    title: 'Unlimited PTO',
    description: 'Take the time you need to recharge with our unlimited vacation policy.',
  },
  {
    icon: Coffee,
    title: 'Office Perks',
    description: 'Fully stocked kitchens, ergonomic workstations, and team events.',
  },
];

const cultureValues = [
  {
    title: 'Innovation First',
    description: 'We push boundaries and embrace new technologies to solve complex problems.',
    icon: Zap,
  },
  {
    title: 'Customer Obsession',
    description: 'Every decision we make is guided by what\'s best for our customers.',
    icon: Heart,
  },
  {
    title: 'Collaborative Spirit',
    description: 'We believe the best work happens when diverse minds come together.',
    icon: Users,
  },
  {
    title: 'Continuous Learning',
    description: 'We invest in growth and encourage experimentation and learning from failure.',
    icon: GraduationCap,
  },
];

const departments = [
  { name: 'Engineering', count: 12, description: 'Build the future of creative production tools' },
  { name: 'Product', count: 4, description: 'Shape product strategy and user experience' },
  { name: 'Design', count: 3, description: 'Create beautiful, intuitive user interfaces' },
  { name: 'Customer Success', count: 6, description: 'Help customers achieve their goals' },
  { name: 'Marketing', count: 4, description: 'Tell our story and grow our community' },
  { name: 'Sales', count: 5, description: 'Connect with creative teams worldwide' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Careers at GHXSTSHIP
            </Badge>
            <h1 className={`${anton.className} uppercase text-4xl lg:text-6xl font-bold mb-6`}>
              JOIN OUR MISSION TO
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                REVOLUTIONIZE CREATIVITY
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Help us build the tools that empower creative teams worldwide. 
              Join a fast-growing company where your work directly impacts the future of production management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="#open-positions">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild>
                <a href="#culture">
                  Learn About Our Culture
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Team Members', value: '150+' },
              { label: 'Open Positions', value: '25+' },
              { label: 'Countries', value: '15+' },
              { label: 'Avg. Tenure', value: '3.2 years' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`${anton.className} uppercase text-3xl lg:text-4xl font-bold text-primary mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} uppercase text-3xl lg:text-4xl font-bold mb-6`}>
              OPEN POSITIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Find your next opportunity and help us build the future of creative production.
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              All Departments
            </Badge>
            {departments.map((dept) => (
              <Badge key={dept.name} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                {dept.name} ({dept.count})
              </Badge>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {openPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`${anton.className} uppercase text-xl font-bold text-foreground`}>
                          {position.title}
                        </h3>
                        <Badge variant="secondary">{position.department}</Badge>
                        {position.remote && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Remote OK
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{position.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {position.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {position.posted}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {position.requirements.slice(0, 3).map((req) => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline">
                        Learn More
                      </Button>
                      <Button>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Don't see a role that fits? We're always looking for exceptional talent.
            </p>
            <Button>
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section id="culture" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} uppercase text-3xl lg:text-4xl font-bold mb-6`}>
              OUR CULTURE & VALUES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We're building more than just software – we're creating a culture where everyone can do their best work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {cultureValues.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className={`${anton.className} uppercase text-lg font-bold mb-3`}>{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Team Photo Placeholder */}
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground">Our Amazing Team</p>
                  <p className="text-muted-foreground">Building the future together</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits & Perks */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} uppercase text-3xl lg:text-4xl font-bold mb-6`}>
              BENEFITS & PERKS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe in taking care of our team with comprehensive benefits and meaningful perks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Departments Overview */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} uppercase text-3xl lg:text-4xl font-bold mb-6`}>
              DEPARTMENTS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore different teams and find where you can make the biggest impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className={`${anton.className} uppercase text-xl font-bold mb-2`}>{dept.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                  <Badge variant="secondary">
                    {dept.count} open position{dept.count !== 1 ? 's' : ''}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} uppercase text-3xl lg:text-4xl font-bold mb-6`}>
              APPLICATION PROCESS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our hiring process is designed to be transparent, efficient, and respectful of your time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Apply', description: 'Submit your application and resume through our careers page.' },
                { step: '02', title: 'Screen', description: 'Initial phone/video call with our recruiting team.' },
                { step: '03', title: 'Interview', description: 'Technical and cultural fit interviews with the team.' },
                { step: '04', title: 'Offer', description: 'Reference checks and offer discussion.' },
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className={`${anton.className} uppercase text-lg font-bold mb-3`}>{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-12">
              <h3 className={`${anton.className} uppercase text-3xl font-bold mb-6`}>
                READY TO JOIN US?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Take the next step in your career and help us build the future of creative production management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="#open-positions">
                    Browse Open Positions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button>
                  Join Our Talent Network
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Questions about working at GHXSTSHIP? Email us at{' '}
                <a href="mailto:careers@ghxstship.com" className="text-primary hover:underline">
                  careers@ghxstship.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
