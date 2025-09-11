'use client';

import React from 'react';
import { Shield, Lock, Award, Users } from 'lucide-react';

export function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      label: 'SOC 2 Compliant',
      value: 'Type II',
    },
    {
      icon: Lock,
      label: 'Data Encrypted',
      value: 'AES-256',
    },
    {
      icon: Award,
      label: 'Uptime SLA',
      value: '99.99%',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: '10,000+',
    },
  ];

  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {signals.map((signal, index) => (
            <div key={index} className="text-center">
              <signal.icon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{signal.value}</div>
              <div className="text-sm text-muted-foreground">{signal.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
