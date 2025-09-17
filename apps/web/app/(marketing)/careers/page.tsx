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
    id: 'vp-technology',
    title: 'VP, Technology',
    department: 'Leadership',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Lead our tech squad through the chaos of scaling production tools. You\'ll be the one making sure our code doesn\'t break when everyone\'s watching.',
    requirements: ['10+ years tech leadership', 'Scaling experience at high-growth companies', 'Can debug production issues at 3am without crying'],
    salary: '$250k - $350k',
    posted: '1 day ago',
  },
  {
    id: 'vp-marketing',
    title: 'VP, Marketing',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Turn our awesome product into stories that actually make people care. Bonus points if you can make B2B software sound exciting (we believe in miracles).',
    requirements: ['8+ years marketing leadership', 'B2B SaaS growth experience', 'Can write copy that doesn\'t put people to sleep'],
    salary: '$200k - $280k',
    posted: '3 days ago',
  },
  {
    id: 'vp-sales',
    title: 'VP, Sales',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    remote: true,
    description: 'Build and lead our sales machine. Help creative teams realize they actually need our software (spoiler: they really do).',
    requirements: ['8+ years sales leadership', 'Enterprise B2B experience', 'Can close deals while maintaining your soul'],
    salary: '$220k - $300k',
    posted: '2 days ago',
  },
  {
    id: 'customer-success-manager',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Be the hero our customers deserve. Turn confused users into raving fans who actually renew their subscriptions.',
    requirements: ['3+ years customer success', 'SaaS experience preferred', 'Patience of a saint, energy of a golden retriever'],
    salary: '$90k - $120k',
    posted: '1 week ago',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Figure out what to build next without making everyone hate you. Balance user needs, business goals, and engineering reality like the product wizard you are.',
    requirements: ['4+ years product management', 'B2B software experience', 'Can say no to feature requests diplomatically'],
    salary: '$140k - $180k',
    posted: '5 days ago',
  },
  {
    id: 'project-director',
    title: 'Project Director',
    department: 'Operations',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    remote: true,
    description: 'Orchestrate complex projects like a conductor leading a symphony, except the musicians are developers and the music is code.',
    requirements: ['7+ years project leadership', 'Creative industry experience', 'Can herd cats and meet deadlines simultaneously'],
    salary: '$130k - $170k',
    posted: '4 days ago',
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Keep projects on track and stakeholders happy. You\'re basically a professional plate-spinner, but with Gantt charts.',
    requirements: ['3+ years project management', 'Agile/Scrum experience', 'Can translate between human and developer languages'],
    salary: '$85k - $115k',
    posted: '6 days ago',
  },
  {
    id: 'project-coordinator',
    title: 'Project Coordinator',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Be the glue that holds projects together. Handle the details so everyone else can focus on the big picture stuff.',
    requirements: ['1+ years coordination experience', 'Organizational skills that would make Marie Kondo jealous', 'Can juggle multiple priorities without dropping the ball'],
    salary: '$55k - $75k',
    posted: '1 week ago',
  },
  {
    id: 'production-manager',
    title: 'Production Manager',
    department: 'Production',
    location: 'Atlanta, GA',
    type: 'Full-time',
    remote: true,
    description: 'Run production operations like the boss you are. Make sure everything happens on time, on budget, and without anyone having a meltdown.',
    requirements: ['5+ years production management', 'Entertainment/events industry experience', 'Can solve problems faster than they appear'],
    salary: '$95k - $125k',
    posted: '3 days ago',
  },
  {
    id: 'production-crew-lead',
    title: 'Production Crew Lead',
    department: 'Production',
    location: 'Various Locations',
    type: 'Full-time',
    remote: false,
    description: 'Lead your crew through the beautiful chaos of live production. Be the calm in the storm when everything\'s on fire (hopefully not literally).',
    requirements: ['3+ years crew leadership', 'Live event experience', 'Can motivate a team at 5am with just coffee and charisma'],
    salary: '$65k - $85k',
    posted: '2 days ago',
  },
  {
    id: 'production-crew-member',
    title: 'Production Crew Member',
    department: 'Production',
    location: 'Various Locations',
    type: 'Full-time',
    remote: false,
    description: 'Be part of the magic that makes events happen. Get your hands dirty, learn from the best, and help create unforgettable experiences.',
    requirements: ['Some production experience preferred', 'Willingness to work weird hours', 'Can lift heavy things and maintain a positive attitude'],
    salary: '$45k - $60k',
    posted: '4 days ago',
  },
  {
    id: 'operations-manager',
    title: 'Operations Manager',
    department: 'Operations',
    location: 'Chicago, IL',
    type: 'Full-time',
    remote: true,
    description: 'Keep our operations running smoother than a fresh jar of Skippy. Optimize processes and make everyone\'s life easier.',
    requirements: ['4+ years operations management', 'Process improvement experience', 'Can find efficiency in chaos'],
    salary: '$90k - $120k',
    posted: '1 week ago',
  },
  {
    id: 'operations-team-lead',
    title: 'Operations Team Lead',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Lead a team of operations rockstars. Make sure everything runs like clockwork while keeping morale higher than a kite.',
    requirements: ['2+ years team leadership', 'Operations experience', 'Can delegate without micromanaging (it\'s an art form)'],
    salary: '$70k - $90k',
    posted: '5 days ago',
  },
  {
    id: 'operations-team-member',
    title: 'Operations Team Member',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    description: 'Be the backbone of our operations team. Handle the day-to-day stuff that keeps everything moving forward.',
    requirements: ['1+ years operations experience', 'Detail-oriented mindset', 'Can work independently without getting distracted by TikTok'],
    salary: '$50k - $65k',
    posted: '6 days ago',
  },
  {
    id: 'independent-contractor-specialized',
    title: 'Independent Contractor, Specialized',
    department: 'Freelance',
    location: 'Remote',
    type: 'Contract',
    remote: true,
    description: 'Bring your specialized skills to our projects. Whether you\'re a lighting wizard, sound guru, or video virtuoso, we need your expertise.',
    requirements: ['Proven expertise in specialized field', 'Portfolio of awesome work', 'Can work independently and meet deadlines'],
    salary: '$75 - $150/hour',
    posted: '2 days ago',
  },
  {
    id: 'independent-contractor-general',
    title: 'Independent Contractor, General',
    department: 'Freelance',
    location: 'Remote',
    type: 'Contract',
    remote: true,
    description: 'Jack-of-all-trades contractor for various project needs. Perfect for multi-talented folks who like variety in their work life.',
    requirements: ['Diverse skill set', 'Adaptability and quick learning', 'Can wear multiple hats without losing your head'],
    salary: '$35 - $75/hour',
    posted: '1 week ago',
  },
  {
    id: 'intern',
    title: 'Intern',
    department: 'Various',
    location: 'San Francisco, CA',
    type: 'Internship',
    remote: true,
    description: 'Learn the ropes while actually contributing to real projects. We promise you\'ll do more than just fetch coffee (though good coffee is always appreciated).',
    requirements: ['Currently enrolled in relevant program', 'Eager to learn and contribute', 'Can handle constructive feedback without crying'],
    salary: '$20 - $25/hour',
    posted: '3 days ago',
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
  { name: 'Leadership', count: 3, description: 'Guide our company through hypergrowth and chaos' },
  { name: 'Operations', count: 6, description: 'Keep the wheels turning and the coffee flowing' },
  { name: 'Production', count: 3, description: 'Make the magic happen in the real world' },
  { name: 'Customer Success', count: 1, description: 'Turn users into superfans who actually pay us' },
  { name: 'Marketing', count: 1, description: 'Make B2B software sound cooler than it actually is' },
  { name: 'Sales', count: 1, description: 'Convince people they need what we\'re selling' },
  { name: 'Product', count: 1, description: 'Decide what to build without breaking everything' },
  { name: 'Freelance', count: 2, description: 'Bring your skills, we\'ll bring the projects' },
  { name: 'Various', count: 1, description: 'Learn stuff while getting paid (barely)' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Careers at GHXSTSHIP
            </Badge>
            <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-6 uppercase`}>
              BUILD YOUR CAREER
              <br />
              WITH GHXSTSHIP
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-8">
              Help us build the tools that empower creative teams worldwide. 
              Join a fast-growing company where your work directly impacts the future of production management.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Button asChild className="group transition-all duration-200 hover:scale-105">
                <a href="#open-positions">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild variant="outline" className="transition-all duration-200 hover:scale-105">
                <a href="#culture">
                  Learn About Our Culture
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-xl max-w-4xl mx-auto">
            {[
              { label: 'Team Members', value: '150+' },
              { label: 'Open Positions', value: '19' },
              { label: 'Countries', value: '15+' },
              { label: 'Avg. Tenure', value: '3.2 years' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`${anton.className} uppercase text-heading-2 lg:text-heading-1 text-heading-3 color-primary mb-2`}>
                  {stat.value}
                </div>
                <div className="color-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              OPEN POSITIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Find your next opportunity and help us build the future of creative production.
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-sm mb-12">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:color-primary-foreground transition-colors">
              All Departments
            </Badge>
            {departments.map((dept) => (
              <Badge key={dept.name} variant="outline" className="cursor-pointer hover:bg-primary hover:color-primary-foreground transition-colors">
                {dept.name} ({dept.count})
              </Badge>
            ))}
          </div>

          {/* Job Listings */}
          <div className="stack-lg max-w-4xl mx-auto">
            {openPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-3">
                        <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 color-foreground`}>
                          {position.title}
                        </h3>
                        <Badge variant="secondary">{position.department}</Badge>
                        {position.remote && (
                          <Badge variant="success">
                            Remote OK
                          </Badge>
                        )}
                      </div>
                      
                      <p className="color-muted mb-4">{position.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-md text-body-sm color-muted mb-4">
                        <div className="flex items-center gap-xs">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-xs">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </div>
                        <div className="flex items-center gap-xs">
                          <DollarSign className="h-4 w-4" />
                          {position.salary}
                        </div>
                        <div className="flex items-center gap-xs">
                          <Calendar className="h-4 w-4" />
                          Posted {position.posted}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-sm">
                        {position.requirements.slice(0, 3).map((req) => (
                          <Badge key={req} variant="outline" className="text-body-sm">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-sm">
                      <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                        Learn More
                      </Button>
                      <Button className="group transition-all duration-200 hover:scale-105">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="color-muted mb-6">
              Don't see a role that fits? We're always looking for exceptional talent.
            </p>
            <Button variant="outline" className="transition-all duration-200 hover:scale-105">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section id="culture" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              OUR CULTURE & VALUES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We're building more than just software – we're creating a culture where everyone can do their best work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-xl mb-16">
            {cultureValues.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 color-primary" />
                    </div>
                    <h3 className={`${anton.className} uppercase text-body text-heading-3 mb-3`}>{value.title}</h3>
                    <p className="text-body-sm color-muted">{value.description}</p>
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
                  <Users className="h-16 w-16 color-primary mx-auto mb-4" />
                  <p className="text-body text-heading-4 color-foreground">Our Amazing Team</p>
                  <p className="color-muted">Building the future together</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits & Perks */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              BENEFITS & PERKS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We believe in taking care of our team with comprehensive benefits and meaningful perks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-lg">
                    <div className="flex items-start gap-md">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 color-primary" />
                      </div>
                      <div>
                        <h3 className={`${anton.className} uppercase text-body text-heading-3 mb-3`}>{benefit.title}</h3>
                        <p className="text-body-sm color-muted">{benefit.description}</p>
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
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              DEPARTMENTS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Explore different teams and find where you can make the biggest impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {departments.map((dept) => (
              <Card key={dept.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 color-primary" />
                  </div>
                  <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-2`}>{dept.name}</h3>
                  <p className="text-body-sm color-muted mb-4">{dept.description}</p>
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
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              APPLICATION PROCESS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Our hiring process is designed to be transparent, efficient, and respectful of your time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-xl">
              {[
                { step: '01', title: 'Apply', description: 'Submit your application and resume through our careers page.' },
                { step: '02', title: 'Screen', description: 'Initial phone/video call with our recruiting team.' },
                { step: '03', title: 'Interview', description: 'Technical and cultural fit interviews with the team.' },
                { step: '04', title: 'Offer', description: 'Reference checks and offer discussion.' },
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center color-primary-foreground text-heading-3 text-body mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className={`${anton.className} uppercase text-body text-heading-3 mb-3`}>{step.title}</h3>
                  <p className="text-body-sm color-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-2xl">
              <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
                READY TO JOIN OUR TEAM?
              </h2>
              <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
                Take the next step in your career and help us build the future of creative production management.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Button asChild className="group transition-all duration-200 hover:scale-105">
                  <a href="#open-positions">
                    Browse Open Positions
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                  Join Our Talent Network
                </Button>
              </div>
              <p className="text-body-sm color-muted mt-6">
                Questions about working at GHXSTSHIP? Email us at{' '}
                <a href="mailto:careers@ghxstship.com" className="color-primary hover:underline">
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
