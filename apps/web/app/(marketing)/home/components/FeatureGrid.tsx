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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            13 Enterprise Modules
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to run your business, all in one platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <feature.icon className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
