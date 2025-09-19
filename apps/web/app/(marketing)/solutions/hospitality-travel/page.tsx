import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Plane, MapPin, Users, Zap, CheckCircle, Play, Star, Compass, Luggage } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Hospitality & Travel Solutions | GHXSTSHIP',
  description: 'Orchestrate exceptional hospitality and travel experiences with GHXSTSHIP. Manage hotels, tours, destinations, and guest services.',
  openGraph: {
    title: 'Hospitality & Travel Solutions | GHXSTSHIP',
    description: 'Orchestrate exceptional hospitality and travel experiences with GHXSTSHIP. Manage hotels, tours, destinations, and guest services.',
    url: 'https://ghxstship.com/solutions/hospitality-travel',
  },
};

const challenges = [
  {
    icon: MapPin,
    title: 'Multi-Location Coordination',
    description: 'Managing operations across multiple destinations, venues, and time zones seamlessly',
    solution: 'Centralized operations dashboard with real-time coordination across all locations and time zones',
  },
  {
    icon: Users,
    title: 'Guest Experience Personalization',
    description: 'Delivering personalized experiences while managing large volumes of guests efficiently',
    solution: 'AI-powered guest profiling with automated personalization and preference management',
  },
  {
    icon: Plane,
    title: 'Complex Logistics Management',
    description: 'Coordinating transportation, accommodations, activities, and services across the journey',
    solution: 'Integrated logistics platform with automated scheduling and real-time tracking',
  },
  {
    icon: Compass,
    title: 'Dynamic Itinerary Management',
    description: 'Adapting to changing conditions, preferences, and unexpected situations in real-time',
    solution: 'Flexible itinerary system with intelligent rescheduling and alternative planning',
  },
];

const features = [
  {
    title: 'Guest Journey Orchestration',
    description: 'End-to-end management of guest experiences from booking to departure',
    benefits: ['Journey mapping', 'Touchpoint optimization', 'Experience tracking', 'Feedback integration'],
  },
  {
    title: 'Hospitality Operations',
    description: 'Comprehensive management of hotels, resorts, and accommodation services',
    benefits: ['Room management', 'Service coordination', 'Staff scheduling', 'Quality assurance'],
  },
  {
    title: 'Travel & Tour Management',
    description: 'Complete coordination of tours, excursions, and travel experiences',
    benefits: ['Itinerary planning', 'Guide management', 'Transportation coordination', 'Activity booking'],
  },
  {
    title: 'Guest Services Platform',
    description: 'Unified platform for concierge services, requests, and guest communication',
    benefits: ['Request management', 'Service tracking', 'Communication hub', 'Satisfaction monitoring'],
  },
];

const caseStudies = [
  {
    title: 'Paradise Resort Collection',
    project: 'Luxury Resort Chain Management',
    challenge: 'Coordinating guest experiences across 12 luxury resorts in 8 countries with 50,000+ annual guests',
    solution: 'Implemented GHXSTSHIP for unified guest journey management and cross-resort service coordination',
    results: [
      '40% increase in guest satisfaction scores',
      '95% on-time service delivery',
      '30% reduction in operational costs',
      '25% increase in repeat bookings',
    ],
    testimonial: 'GHXSTSHIP transformed our guest experience from good to extraordinary. Every touchpoint is now seamless.',
    author: 'Isabella Rodriguez, Director of Guest Experience',
  },
  {
    title: 'Adventure Expeditions Global',
    project: 'Multi-Destination Adventure Tours',
    challenge: 'Managing complex adventure tours across remote locations with unpredictable conditions for 5,000+ travelers',
    solution: 'Used GHXSTSHIP for dynamic itinerary management with real-time adaptation and safety coordination',
    results: [
      '99.8% safety record maintained',
      '50% faster response to itinerary changes',
      '35% improvement in guide efficiency',
      '4.9/5 average trip rating',
    ],
    testimonial: 'The platform enabled us to deliver world-class adventures while maintaining the highest safety standards.',
    author: 'Captain James Mitchell, Operations Director',
  },
];

const integrations = [
  { name: 'Booking.com', category: 'Reservations' },
  { name: 'Amadeus', category: 'Travel Systems' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'TripAdvisor', category: 'Reviews' },
  { name: 'Google Maps', category: 'Navigation' },
  { name: 'WhatsApp', category: 'Communication' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Weather API', category: 'Weather Data' },
];

export default function HospitalityTravelPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Hospitality & Travel
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  CRAFT
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                    UNFORGETTABLE
                  </span>
                  <br />
                  JOURNEYS
                </h1>
                <p className="text-heading-4 color-muted">
                  From luxury resorts to adventure expeditions, GHXSTSHIP empowers 
                  hospitality and travel professionals to create extraordinary experiences 
                  that guests will treasure forever.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>1M+</div>
                  <div className="text-body-sm color-muted">Guests Served</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>150+</div>
                  <div className="text-body-sm color-muted">Destinations</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>99.2%</div>
                  <div className="text-body-sm color-muted">On-Time Performance</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>4.8/5</div>
                  <div className="text-body-sm color-muted">Average Rating</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Journey
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto group">
                  <Play className="mr-sm h-4 w-4" />
                  Explore Destinations
                </Button>
              </div>
            </div>

            {/* Travel Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-popover overflow-hidden">
                <div className="flex items-center gap-sm px-md py-sm bg-secondary/50 border-b">
                  <div className="flex gap-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-sm  px-md py-xs bg-background rounded-md text-body-sm color-muted">
                      <Plane className="w-3 h-3" />
                      travel.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>PARADISE RESORT BALI</h3>
                    <Badge variant="outline" className="text-foreground border-primary">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Occupancy</div>
                      <div>87%</div>
                      <div className="flex items-center gap-xs mt-xs">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-body-sm color-success">High</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Check-ins</div>
                      <div>42</div>
                      <div className="flex -cluster-xs mt-xs">
                        {[1, 2, 3, 4].map((i: any) => (
                          <div key={i} className="w-3 h-3 bg-primary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Satisfaction</div>
                      <div>4.9/5</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-primary h-1 rounded-full w-11/12"></div>
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Today's Activities</div>
                    {[
                      { activity: 'Sunrise Yoga', time: '6:00 AM', guests: 28, color: 'bg-warning' },
                      { activity: 'Snorkeling Tour', time: '10:00 AM', guests: 45, color: 'bg-primary' },
                      { activity: 'Sunset Dinner', time: '7:00 PM', guests: 89, color: 'bg-info' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.activity}</span>
                        <span className="color-muted">{item.time}</span>
                        <span className="color-muted">({item.guests})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-sm pt-sm border-t">
                    <Luggage className="w-4 h-4 text-foreground" />
                    <span className="text-body-sm form-label">VIP Arrival: Royal Suite - 3:30 PM</span>
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
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              HOSPITALITY & TRAVEL CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Creating exceptional guest experiences requires seamless coordination across multiple touchpoints and locations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge: any) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-primary">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{challenge.title}</h3>
                        <p className="color-muted mb-md">{challenge.description}</p>
                        <div className="flex items-start gap-sm">
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
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              COMPLETE HOSPITALITY PLATFORM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to deliver world-class hospitality and travel experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {features.map((feature: any) => (
              <Card key={feature.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-md uppercase`}>{feature.title}</h3>
                  <p className="color-muted mb-lg">{feature.description}</p>
                  
                  <div className="stack-sm">
                    {feature.benefits.map((benefit: any) => (
                      <div key={benefit} className="flex items-center gap-sm">
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
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              EXCEPTIONAL JOURNEY STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how hospitality leaders are creating unforgettable experiences with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-2xl">
            {caseStudies.map((study: any) => (
              <Card key={study.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <div className="grid lg:grid-cols-2 gap-xl">
                    <div>
                      <Badge variant="outline" className="mb-md">{study.project}</Badge>
                      <h3 className={`${anton.className} text-heading-3 text-heading-3 mb-md uppercase`}>{study.title}</h3>
                      
                      <div className="stack-md">
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">CHALLENGE</h4>
                          <p className="color-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">SOLUTION</h4>
                          <p className="color-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-md uppercase">RESULTS</h4>
                      <div className="stack-sm mb-lg">
                        {study.results.map((result: any) => (
                          <div key={result} className="flex items-center gap-sm">
                            <Star className="h-4 w-4 color-warning flex-shrink-0" />
                            <span className="text-body-sm form-label color-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-md">
                        <p className="color-foreground italic mb-sm">"{study.testimonial}"</p>
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
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              TRAVEL ECOSYSTEM INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with leading travel and hospitality platforms for seamless operations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration: any) => (
              <Card key={integration.name} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary rounded-lg flex items-center justify-center mx-auto mb-md">
                    <Zap className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-xs">{integration.name}</h3>
                  <p className="text-body-sm color-muted">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO CREATE MAGIC?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join hospitality leaders using GHXSTSHIP to craft extraordinary journeys 
              that turn first-time guests into lifelong advocates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Journey
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
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
