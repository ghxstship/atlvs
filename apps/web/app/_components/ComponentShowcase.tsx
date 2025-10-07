'use client';

import React, { useState } from 'react';
import { Button } from '@ghxstship/ui/atoms';
import { Select } from '@ghxstship/ui/atoms';
import { Skeleton, SkeletonText, SkeletonCircle } from '@ghxstship/ui/atoms';
import { SearchBar } from '@ghxstship/ui/molecules';
import { Card } from '@ghxstship/ui/organisms';

// Example demonstrating world-class component usage patterns
export default function ComponentShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);

  // Example options for Select
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  // Simulate search with loading
  const handleSearch = async (value: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    console.log('Searching for:', value);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">World-Class Component Showcase</h1>
        <p className="text-muted-foreground">
          Demonstrating standardized, atomic design patterns that exceed competitors.
        </p>
      </div>

      {/* Search Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Search Components</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Standardized SearchBar</label>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              placeholder="Search anything..."
              loading={loading}
              className="max-w-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Atomic Select Component</label>
            <Select
              value={selectedOption}
              onValueChange={setSelectedOption}
              options={selectOptions}
              placeholder="Choose an option"
              className="max-w-xs"
            />
          </div>
        </div>
      </Card>

      {/* Button Variants */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Button System</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="success">Success Button</Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <Button loading>Loading State</Button>
          <Button disabled>Disabled State</Button>
        </div>
      </Card>

      {/* Loading States */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Skeleton Loading States</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Text Skeletons</h3>
            <div className="space-y-2">
              <SkeletonText />
              <SkeletonText className="w-3/4" />
              <SkeletonText className="w-1/2" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Avatar Skeletons</h3>
            <div className="flex space-x-4">
              <SkeletonCircle />
              <SkeletonCircle />
              <SkeletonCircle />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Card Skeleton</h3>
            <div className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-2">
                <SkeletonCircle size="sm" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Patterns */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Standardized Usage Patterns</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">✅ CORRECT: Atomic Composition</h3>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Molecules compose from atoms only
<SearchBar>
  <Icon name="search" />  {/* Atom */}
  <Input />              {/* Atom */}
  <Button variant="ghost"> {/* Atom */}
</SearchBar>`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">❌ INCORRECT: Direct Styling</h3>
            <pre className="bg-destructive/10 p-3 rounded text-xs overflow-x-auto border border-destructive/20">
{`// Never use hardcoded values
<div className="p-4 bg-blue-500 rounded-lg">
  {/* No token usage, not reusable */}
</div>`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">✅ CORRECT: Template Usage</h3>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Pages use templates, handle data only
export default function ProjectsPage() {
  const { projects } = useProjects();
  
  return (
    <ListLayout
      title="Projects"
      filters={<ProjectFilters />}
      content={projects.map(p => <TaskCard task={p} />)}
    />
  );
}`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Performance & Accessibility */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enterprise Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">⚡ Performance Optimized</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Virtual scrolling for large lists</li>
              <li>• Lazy loading for components</li>
              <li>• Optimized bundle splitting</li>
              <li>• Image optimization built-in</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">♿ Accessibility Compliant</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• WCAG 2.1 AAA compliance</li>
              <li>• Keyboard navigation</li>
              <li>• Screen reader support</li>
              <li>• Focus management</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
