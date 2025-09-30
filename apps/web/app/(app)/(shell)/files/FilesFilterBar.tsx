'use client';


import { X, Filter } from "lucide-react";
import { useState, useEffect } from 'react';
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
 <div className="mb-md p-sm bg-secondary/50 rounded-lg border" role="region" aria-label={t('filters.title')}>
 <div className="flex items-center gap-sm mb-sm">
 <Filter className="h-4 w-4" />
 <span className="text-body-sm form-label">{t('filters.title')}</span>
 {selectedTags.length > 0 && (
 <button
 onClick={clearAllTags}
 className="text-body-sm color-muted hover:color-foreground"
 aria-label={t('filters.clearAll')}
 >
 {t('filters.clearAll')}
 </button>
 )}
 </div>
 
 {loading ? (
 <div className="flex gap-sm">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-6 w-16 bg-secondary rounded animate-pulse" />
 ))}
 </div>
 ) : (
 <div className="flex flex-wrap gap-sm">
 {availableTags.map(tag => {
 const isSelected = selectedTags.includes(tag.tag);
 return (
 <button
 key={tag.id}
 onClick={() => toggleTag(tag.tag)}
 className={`inline-flex items-center gap-xs px-sm py-xs rounded-full text-body-sm border transition-colors ${
 isSelected
 ? 'bg-accent/10 border-primary/30 color-accent'
 : 'bg-background border-border color-foreground hover:bg-secondary/50'
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
