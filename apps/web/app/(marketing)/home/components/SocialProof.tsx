'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function SocialProof() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO at TechCorp',
      content: 'GHXSTSHIP saved us months of development time. The enterprise features are exactly what we needed.',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Founder at StartupX',
      content: 'The multi-tenant architecture and RBAC system are incredibly well designed. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Engineering Lead at ScaleUp',
      content: 'From zero to production in days, not months. The module system is a game-changer.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600">
            See what our customers are saying about GHXSTSHIP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Quote className="w-8 h-8 text-gray-300 mb-4" />
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                {testimonial.content}
              </p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
