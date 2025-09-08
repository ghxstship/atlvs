'use client';

import { useState } from 'react';
import { Card, CardContent, Badge } from '@ghxstship/ui';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'VP of Production',
    company: 'Meridian Studios',
    avatar: '/avatars/sarah-chen.jpg',
    rating: 5,
    quote: 'GHXSTSHIP has revolutionized how we manage our productions. The integration between ATLVS and OPENDECK is seamless, and we\'ve reduced our project timelines by 40%.',
    project: 'The Last Frontier',
    industry: 'Film & TV',
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    role: 'Creative Director',
    company: 'Apex Advertising',
    avatar: '/avatars/marcus-rodriguez.jpg',
    rating: 5,
    quote: 'Finding the right talent used to take weeks. With OPENDECK, we can connect with verified professionals in hours. The quality and speed are unmatched.',
    project: 'Global Brand Campaign',
    industry: 'Advertising',
  },
  {
    id: 3,
    name: 'Emily Watson',
    role: 'Head of Operations',
    company: 'Harmony Events',
    avatar: '/avatars/emily-watson.jpg',
    rating: 5,
    quote: 'The real-time collaboration features in ATLVS have transformed our team dynamics. Everyone stays aligned, and nothing falls through the cracks anymore.',
    project: 'Music Festival Series',
    industry: 'Events',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Production Manager',
    company: 'Stellar Productions',
    avatar: '/avatars/david-kim.jpg',
    rating: 5,
    quote: 'The analytics and reporting capabilities give us insights we never had before. We can predict bottlenecks and optimize our workflows proactively.',
    project: 'Corporate Video Series',
    industry: 'Corporate',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Executive Producer',
    company: 'Pinnacle Media',
    avatar: '/avatars/lisa-thompson.jpg',
    rating: 5,
    quote: 'GHXSTSHIP isn\'t just a tool, it\'s a competitive advantage. Our clients are amazed by our efficiency and the quality of our deliverables.',
    project: 'Documentary Series',
    industry: 'Film & TV',
  },
];

const caseStudies = [
  {
    company: 'Meridian Studios',
    industry: 'Film & TV',
    challenge: 'Managing complex multi-location shoots',
    result: '40% faster project completion',
    metric: '$2M saved annually',
    logo: '/logos/meridian.svg',
  },
  {
    company: 'Apex Advertising',
    industry: 'Advertising',
    challenge: 'Finding specialized creative talent',
    result: '90% reduction in hiring time',
    metric: '300% ROI increase',
    logo: '/logos/apex.svg',
  },
  {
    company: 'Harmony Events',
    industry: 'Events',
    challenge: 'Coordinating large-scale events',
    result: '99.8% event success rate',
    metric: '50% cost reduction',
    logo: '/logos/harmony.svg',
  },
];

export function SocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Social Proof
          </Badge>
          <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
            TRUSTED BY
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              INDUSTRY LEADERS
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of creative professionals and enterprises who have transformed 
            their production workflows with GHXSTSHIP.
          </p>
        </div>

        {/* Featured Testimonial Carousel */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="relative overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <div className="flex items-start gap-6">
                {/* Quote Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Quote className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl lg:text-2xl text-foreground mb-6 leading-relaxed">
                    "{testimonials[currentTestimonial].quote}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="secondary">
                        {testimonials[currentTestimonial].industry}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentTestimonial ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Studies */}
        <div className="mb-16">
          <h3 className="font-title text-2xl font-bold text-center mb-8">
            SUCCESS STORIES
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((study) => (
              <Card key={study.company} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Company Logo */}
                  <div className="w-16 h-8 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {study.company}
                    </span>
                  </div>

                  {/* Industry Badge */}
                  <Badge variant="outline" className="mb-4">
                    {study.industry}
                  </Badge>

                  {/* Challenge */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      CHALLENGE
                    </h4>
                    <p className="text-sm text-foreground">{study.challenge}</p>
                  </div>

                  {/* Result */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      RESULT
                    </h4>
                    <p className="text-sm text-foreground">{study.result}</p>
                  </div>

                  {/* Metric */}
                  <div className="pt-4 border-t">
                    <div className="font-title text-lg font-bold text-primary">
                      {study.metric}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-title text-3xl font-bold text-foreground mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Client Satisfaction</div>
          </div>
          <div>
            <div className="font-title text-3xl font-bold text-foreground mb-2">40%</div>
            <div className="text-sm text-muted-foreground">Average Time Saved</div>
          </div>
          <div>
            <div className="font-title text-3xl font-bold text-foreground mb-2">$2M+</div>
            <div className="text-sm text-muted-foreground">Cost Savings Generated</div>
          </div>
          <div>
            <div className="font-title text-3xl font-bold text-foreground mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Expert Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
