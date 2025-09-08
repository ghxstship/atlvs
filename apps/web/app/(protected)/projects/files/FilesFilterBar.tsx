'use client';

import { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

interface Tag {
  id: string;
  tag: string;
}

interface FilesFilterBarProps {
  orgId: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function FilesFilterBar({ orgId, selectedTags, onTagsChange }: FilesFilterBarProps) {
  const t = useTranslations('files');
  const sb = createBrowserClient();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await sb
          .from('tags')
          .select('id, tag')
          .eq('organization_id', orgId)
          .eq('entity_type', 'file')
          .order('tag', { ascending: true });
        
        // Dedupe by tag name
        const unique = (data || []).reduce((acc: Tag[], curr) => {
          if (!acc.find(t => t.tag === curr.tag)) {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        setAvailableTags(unique);
      } catch {
        setAvailableTags([]);
      }
      setLoading(false);
    })();
  }, [orgId, sb]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border" role="region" aria-label={t('filters.title')}>
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">{t('filters.title')}</span>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t('filters.clearAll')}
          >
            {t('filters.clearAll')}
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => {
            const isSelected = selectedTags.includes(tag.tag);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.tag)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                  isSelected
                    ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? t('filters.remove') : t('filters.add')} ${tag.tag}`}
              >
                {tag.tag}
                {isSelected && <X className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
