'use client';

import React, { useState } from 'react';
import { Drawer, Button, Input, Textarea, Select } from '@ghxstship/ui';
import { resourcesService } from '../lib/resources-service';

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  userId: string;
}

export default function CreateDrawer({ open, onClose, onSuccess, organizationId, userId }: CreateDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'guide' as const,
    category: '',
    status: 'draft' as const,
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await resourcesService.createResource(organizationId, userId, {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      if (result) {
        setFormData({
          title: '',
          description: '',
          type: 'guide',
          category: '',
          status: 'draft',
          tags: ''
        });
        onSuccess();
        onClose();
      } else {
        setError('Failed to create resource');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Create New Resource" width="lg">
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-md py-sm rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-xs">
          <label htmlFor="title" className="text-sm font-medium">Title *</label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter resource title"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-xs">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter resource description"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label htmlFor="type" className="text-sm font-medium">Type *</label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.e.target.value as any })}
              disabled={loading}
            >
              <option value="guide">Guide</option>
              <option value="policy">Policy</option>
              <option value="training">Training</option>
              <option value="template">Template</option>
              <option value="procedure">Procedure</option>
            </Select>
          </div>

          <div className="space-y-xs">
            <label htmlFor="category" className="text-sm font-medium">Category *</label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Operations"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-xs">
          <label htmlFor="tags" className="text-sm font-medium">Tags</label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Comma-separated tags"
            disabled={loading}
          />
        </div>

        <div className="space-y-xs">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <Select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.e.target.value as any })}
            disabled={loading}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="under_review">Under Review</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-sm pt-md border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Resource'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
