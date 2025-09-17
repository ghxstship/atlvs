'use client';

import React from 'react';
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  ShoppingCart, Building, DollarSign, BarChart,
  FileText, Settings, User, Workflow, Package
} from 'lucide-react';

export function FeatureGrid() {
  const features = [
    { icon: LayoutDashboard, name: 'Dashboard', description: 'Customizable analytics and insights' },
    { icon: Briefcase, name: 'Projects', description: 'Complete project management suite' },
    { icon: Users, name: 'People', description: 'HR and team management tools' },
    { icon: Calendar, name: 'Programming', description: 'Event and schedule management' },
    { icon: Workflow, name: 'Pipeline', description: 'Sales and workflow automation' },
    { icon: ShoppingCart, name: 'Procurement', description: 'Purchase order management' },
    { icon: Package, name: 'Jobs', description: 'Job tracking and assignments' },
    { icon: Building, name: 'Companies', description: 'Client and vendor management' },
    { icon: DollarSign, name: 'Finance', description: 'Financial tracking and reporting' },
    { icon: BarChart, name: 'Analytics', description: 'Advanced data visualization' },
    { icon: FileText, name: 'Resources', description: 'Document and asset management' },
    { icon: Settings, name: 'Settings', description: 'System configuration' },
    { icon: User, name: 'Profile', description: 'User profile management' },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-heading-2 text-heading-3 color-foreground mb-4">
            13 Enterprise Modules
          </h2>
          <p className="text-body color-muted max-w-2xl mx-auto">
            Everything you need to run your business, all in one platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow">
              <feature.icon className="w-8 h-8 color-primary mb-3" />
              <h3 className="text-heading-4 color-foreground mb-1">{feature.name}</h3>
              <p className="text-body-sm color-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
