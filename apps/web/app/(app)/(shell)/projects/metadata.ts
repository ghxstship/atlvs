import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projects');

  return {
    title: t('title') || 'Project Management',
    description: t('description') || 'Manage projects, tasks, and team collaboration for GHXSTSHIP',
    keywords: ['projects', 'management', 'tasks', 'collaboration', 'teams', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Project Management',
      description: t('description') || 'Manage projects, tasks, and team collaboration for GHXSTSHIP',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Project Management',
      description: t('description') || 'Manage projects, tasks, and team collaboration for GHXSTSHIP'
    }
  };
}
