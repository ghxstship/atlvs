import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Eye, Layers, Users, Zap, CheckCircle, Play, Star, Headphones, Gamepad2 } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Immersive Experiences Solutions | GHXSTSHIP',
  description: 'Create cutting-edge immersive experiences with GHXSTSHIP. Manage VR/AR productions, interactive installations, and multi-sensory environments.',
  openGraph: {
    title: 'Immersive Experiences Solutions | GHXSTSHIP',
    description: 'Create cutting-edge immersive experiences with GHXSTSHIP. Manage VR/AR productions, interactive installations, and multi-sensory environments.',
    url: 'https://ghxstship.com/solutions/immersive-experiences',
  },
};

const challenges = [
  {
    icon: Eye,
    title: 'Multi-Platform Content Creation',
    description: 'Developing immersive content across VR, AR, mixed reality, and interactive installations',
    solution: 'Unified content management system with cross-platform compatibility and version control',
  },
  {
    icon: Layers,
    title: 'Complex Technical Integration',
    description: 'Coordinating hardware, software, sensors, and interactive elements seamlessly',
    solution: 'Technical integration workflows with real-time system monitoring and troubleshooting',
  },
  {
    icon: Users,
    title: 'Interdisciplinary Team Coordination',
    description: 'Managing developers, designers, artists, engineers, and experience specialists',
    solution: 'Specialized collaboration tools with role-based workflows and skill matching',
  },
  {
    icon: Headphones,
    title: 'User Experience Optimization',
    description: 'Testing and refining immersive experiences for maximum engagement and comfort',
    solution: 'User testing frameworks with biometric feedback and experience analytics',
  },
];

const features = [
  {
    title: 'Immersive Content Production',
    description: 'End-to-end management for VR, AR, and mixed reality content creation',
    benefits: ['Asset pipeline', 'Version control', 'Platform optimization', 'Quality assurance'],
  },
  {
    title: 'Interactive Installation Management',
    description: 'Coordinate complex interactive environments and multi-sensory experiences',
    benefits: ['Hardware integration', 'Sensor management', 'Real-time monitoring', 'Maintenance scheduling'],
  },
  {
    title: 'Experience Design Collaboration',
    description: 'Unified workspace for creative and technical teams to design immersive experiences',
    benefits: ['Design workflows', 'Prototype testing', 'Feedback integration', 'Iteration tracking'],
  },
  {
    title: 'Performance Analytics',
    description: 'Comprehensive analytics for user engagement and experience optimization',
    benefits: ['User behavior tracking', 'Engagement metrics', 'Performance monitoring', 'A/B testing'],
  },
];

const caseStudies = [
  {
    title: 'Future Worlds Museum',
    project: 'Interactive Science Exhibition',
    challenge: 'Creating 12 immersive installations with AR, VR, and interactive elements for 500K+ annual visitors',
    solution: 'Implemented GHXSTSHIP for coordinated development and deployment of all interactive experiences',
    results: [
      '300% increase in visitor engagement',
      '95% uptime across all installations',
      '40% reduction in development time',
      'Winner of 3 international design awards',
    ],
    testimonial: 'GHXSTSHIP enabled us to create the most advanced interactive museum experience in the world.',
    author: 'Dr. Elena Rodriguez, Chief Experience Officer',
  },
  {
    title: 'Nexus VR Studios',
    project: 'Multi-Platform VR Experience Series',
    challenge: 'Developing and deploying VR experiences across 15 different platforms and devices simultaneously',
    solution: 'Used GHXSTSHIP for unified content management and cross-platform optimization workflows',
    results: [
      '50% faster multi-platform deployment',
      '99.5% compatibility across all platforms',
      '25% reduction in bug reports',
      '2M+ downloads in first month',
    ],
    testimonial: 'The platform revolutionized our multi-platform development process. We can now reach every VR user.',
    author: 'Marcus Chen, Creative Director',
  },
];

const integrations = [
  { name: 'Unity', category: 'Game Engine' },
  { name: 'Unreal Engine', category: 'Game Engine' },
  { name: 'Blender', category: '3D Creation' },
  { name: 'Maya', category: '3D Animation' },
  { name: 'TouchDesigner', category: 'Interactive Media' },
  { name: 'Arduino', category: 'Hardware' },
  { name: 'Oculus SDK', category: 'VR Platform' },
  { name: 'ARCore', category: 'AR Platform' },
];

export default function ImmersiveExperiencesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Immersive Experiences
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-6 uppercase`}>
                  BUILD THE
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                    FUTURE OF
                  </span>
                  <br />
                  EXPERIENCE
                </h1>
                <p className="text-heading-4 color-muted">
                  From virtual reality to interactive installations, GHXSTSHIP empowers 
                  creators to develop cutting-edge immersive experiences that blur the 
                  lines between digital and physical worlds.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>1000+</div>
                  <div className="text-body-sm color-muted">Experiences Created</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>10M+</div>
                  <div className="text-body-sm color-muted">Users Engaged</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>50+</div>
                  <div className="text-body-sm color-muted">Platforms Supported</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>98%</div>
                  <div className="text-body-sm color-muted">User Satisfaction</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Building
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Experience Demo
                </Button>
              </div>
            </div>

            {/* Immersive Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-body-sm color-muted">
                      <Eye className="w-3 h-3" />
                      immersive.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>QUANTUM WORLDS VR</h3>
                    <Badge variant="outline" className="color-success border-success">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-body-sm color-muted mb-1">Active Users</div>
                      <div className="text-heading-4">2.5K</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-body-sm color-success">Live</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-body-sm color-muted mb-1">Platforms</div>
                      <div className="text-heading-4">8</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-primary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-body-sm color-muted mb-1">Engagement</div>
                      <div className="text-heading-4">94%</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-2">
                        <div className="bg-primary h-1 rounded-full w-11/12"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-body-sm form-label color-muted">Platform Performance</div>
                    {[
                      { platform: 'Oculus Quest', performance: '98%', color: 'bg-success' },
                      { platform: 'Steam VR', performance: '95%', color: 'bg-primary' },
                      { platform: 'PlayStation VR', performance: '92%', color: 'bg-secondary' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.platform}</span>
                        <span className="color-muted">{item.performance}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Gamepad2 className="w-4 h-4 color-primary" />
                    <span className="text-body-sm form-label">Next Update: Enhanced Physics Engine</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              IMMERSIVE EXPERIENCE CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Creating immersive experiences requires coordination of cutting-edge technology and creative vision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-primary">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-3 uppercase`}>{challenge.title}</h3>
                        <p className="color-muted mb-4">{challenge.description}</p>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 color-success flex-shrink-0 mt-0.5" />
                          <p className="text-body-sm form-label color-foreground">{challenge.solution}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              NEXT-GENERATION EXPERIENCE PLATFORM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to create, deploy, and manage immersive experiences across all platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-4 uppercase`}>{feature.title}</h3>
                  <p className="color-muted mb-6">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 color-success flex-shrink-0" />
                        <span className="text-body-sm color-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              IMMERSIVE SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how pioneers in immersive technology are creating groundbreaking experiences with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <Badge variant="outline" className="mb-4">{study.project}</Badge>
                      <h3 className={`${anton.className} text-heading-3 text-heading-3 mb-4 uppercase`}>{study.title}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-2 uppercase">CHALLENGE</h4>
                          <p className="color-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-2 uppercase">SOLUTION</h4>
                          <p className="color-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-4 uppercase">RESULTS</h4>
                      <div className="space-y-3 mb-6">
                        {study.results.map((result) => (
                          <div key={result} className="flex items-center gap-2">
                            <Star className="h-4 w-4 color-warning flex-shrink-0" />
                            <span className="text-body-sm form-label color-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-4">
                        <p className="color-foreground italic mb-2">"{study.testimonial}"</p>
                        <cite className="text-body-sm color-muted">— {study.author}</cite>
                      </blockquote>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              IMMERSIVE TECHNOLOGY INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with the leading platforms and tools for immersive content creation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-1">{integration.name}</h3>
                  <p className="text-body-sm color-muted">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              READY TO SHAPE THE FUTURE?
            </h2>
            <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
              Join innovative creators using GHXSTSHIP to build the next generation 
              of immersive experiences that will define how we interact with digital worlds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
