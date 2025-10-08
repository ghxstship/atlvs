'use client';

import React from 'react';
import { Card, Button } from '@ghxstship/ui';
import { FileText, Save } from 'lucide-react';

interface FormViewProps {
  schema?: unknown;
  onSubmit?: (data: unknown) => void;
  title?: string;
}

export default function FormView({ schema, onSubmit, title = 'Form' }: FormViewProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({});
  };

  return (
    <Card className="h-full">
      <div className="p-6 border-b">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" />
          {title}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Report Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter report name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Data Source
            </label>
            <select className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select data source</option>
              <option value="projects">Projects</option>
              <option value="finance">Finance</option>
              <option value="people">People</option>
              <option value="jobs">Jobs</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
}
