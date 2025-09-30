import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('jobs');

  return {
    title: t('title') || 'Job Management',
    description: t('description') || 'Manage job opportunities, assignments, and pipeline tracking for GHXSTSHIP',
    keywords: ['jobs', 'opportunities', 'assignments', 'pipeline', 'recruiting', 'hiring', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Job Management',
      description: t('description') || 'Manage job opportunities, assignments, and pipeline tracking for GHXSTSHIP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Job Management',
      description: t('description') || 'Manage job opportunities, assignments, and pipeline tracking for GHXSTSHIP',
    },
  };
}
