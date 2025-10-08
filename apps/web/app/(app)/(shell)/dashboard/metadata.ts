import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');

  return {
    title: t('title') || 'Dashboard',
    description: t('description') || 'Overview of your GHXSTSHIP workspace with key metrics and insights',
    keywords: ['dashboard', 'overview', 'metrics', 'analytics', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Dashboard',
      description: t('description') || 'Overview of your GHXSTSHIP workspace with key metrics and insights',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Dashboard',
      description: t('description') || 'Overview of your GHXSTSHIP workspace with key metrics and insights'
    }
  };
}
