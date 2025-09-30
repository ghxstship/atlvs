import type { LucideIcon } from 'lucide-react';

export interface Challenge {
  icon: LucideIcon;
  title: string;
  description: string;
  solution: string;
}

export interface Feature {
  title: string;
  description: string;
  benefits: string[];
}

export interface CaseStudy {
  title: string;
  project: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonial: string;
  author: string;
}

export interface Integration {
  name: string;
  category: string;
}
