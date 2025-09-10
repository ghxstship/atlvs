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
      <section className="py-20 bg-gradient-to-br from-blue-500/5 via-background to-indigo-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Hospitality & Travel
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  CRAFT
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    UNFORGETTABLE
                  </span>
                  <br />
                  JOURNEYS
                </h1>
                <p className="text-xl text-muted-foreground">
                  From luxury resorts to adventure expeditions, GHXSTSHIP empowers 
                  hospitality and travel professionals to create extraordinary experiences 
                  that guests will treasure forever.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>1M+</div>
                  <div className="text-sm text-muted-foreground">Guests Served</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>150+</div>
                  <div className="text-sm text-muted-foreground">Destinations</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>99.2%</div>
                  <div className="text-sm text-muted-foreground">On-Time Performance</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>4.8/5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Journey
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Explore Destinations
                </Button>
              </div>
            </div>

            {/* Travel Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-xs text-muted-foreground">
                      <Plane className="w-3 h-3" />
                      travel.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>PARADISE RESORT BALI</h3>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Occupancy</div>
                      <div className="font-semibold">87%</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-500">High</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Check-ins</div>
                      <div className="font-semibold">42</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-blue-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Satisfaction</div>
                      <div className="font-semibold">4.9/5</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-blue-500 h-1 rounded-full w-11/12"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Today's Activities</div>
                    {[
                      { activity: 'Sunrise Yoga', time: '6:00 AM', guests: 28, color: 'bg-orange-500' },
                      { activity: 'Snorkeling Tour', time: '10:00 AM', guests: 45, color: 'bg-blue-500' },
                      { activity: 'Sunset Dinner', time: '7:00 PM', guests: 89, color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="font-medium flex-1">{item.activity}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                        <span className="text-muted-foreground">({item.guests})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Luggage className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">VIP Arrival: Royal Suite - 3:30 PM</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
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
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              HOSPITALITY & TRAVEL CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Creating exceptional guest experiences requires seamless coordination across multiple touchpoints and locations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-xl font-bold mb-3 uppercase`}>{challenge.title}</h3>
                        <p className="text-muted-foreground mb-4">{challenge.description}</p>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-foreground">{challenge.solution}</p>
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
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              COMPLETE HOSPITALITY PLATFORM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to deliver world-class hospitality and travel experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className={`${anton.className} text-xl font-bold mb-4 uppercase`}>{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
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
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              EXCEPTIONAL JOURNEY STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how hospitality leaders are creating unforgettable experiences with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <Badge variant="outline" className="mb-4">{study.project}</Badge>
                      <h3 className={`${anton.className} text-2xl font-bold mb-4 uppercase`}>{study.title}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">CHALLENGE</h4>
                          <p className="text-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">SOLUTION</h4>
                          <p className="text-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-4 uppercase">RESULTS</h4>
                      <div className="space-y-3 mb-6">
                        {study.results.map((result) => (
                          <div key={result} className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-4">
                        <p className="text-foreground italic mb-2">"{study.testimonial}"</p>
                        <cite className="text-sm text-muted-foreground">— {study.author}</cite>
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
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              TRAVEL ECOSYSTEM INTEGRATIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with leading travel and hospitality platforms for seamless operations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO CREATE MAGIC?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hospitality leaders using GHXSTSHIP to craft extraordinary journeys 
              that turn first-time guests into lifelong advocates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Journey
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
