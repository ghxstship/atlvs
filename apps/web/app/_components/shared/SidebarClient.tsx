'use client';


import { Badge, Button, cn } from '@ghxstship/ui';
import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Building, 
  Briefcase, 
  Calendar, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'People', href: '/people', icon: Users, badge: '12' },
  { name: 'Companies', href: '/companies', icon: Building },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Programming', href: '/programming', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export default function SidebarClient() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Handle escape key
    }
  }


  return (
    <div className="flex h-full w-md flex-col bg-background border-r">
      <div className="flex h-xs items-center px-md">
        <h1 className="text-heading-md text-heading-3">GHXSTSHIP</h1>
      </div>
      
      <nav className="flex-1 space-y-xs px-md py-md" aria-label="Main navigation">
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-sm focus:left-none z-50 bg-background color-foreground p-sm rounded"
  >
    Skip to main content
  </a>
        {navigation.map((item: any) => (
          <div key={item.name}>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => item.children && toggleExpanded(item.name)}
            >
              <item.icon className="mr-sm h-icon-xs w-icon-xs" />
              {item.name}
              {item.badge && (
                <Badge variant="outline" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
              {item.children && (
                expandedItems.includes(item.name) ? (
                  <ChevronDown className="ml-auto h-icon-xs w-icon-xs" />
                ) : (
                  <ChevronRight className="ml-auto h-icon-xs w-icon-xs" />
                )
              )}
            </Button>
            
            {item.children && expandedItems.includes(item.name) && (
              <div className="ml-md mt-xs space-y-xs">
                {item.children.map((child: any) => (
                  <Button aria-label="action" onClick={() => {}}
                    key={child.name}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <child.icon className="mr-sm h-xs w-xs" />
                    {child.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
