import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('analytics');

  return {
    title: t('title') || 'Business Analytics',
    description: t('description') || 'Advanced analytics, reporting, and business intelligence for GHXSTSHIP',
    keywords: ['analytics', 'reporting', 'business intelligence', 'data', 'insights', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Business Analytics',
      description: t('description') || 'Advanced analytics, reporting, and business intelligence for GHXSTSHIP',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Business Analytics',
      description: t('description') || 'Advanced analytics, reporting, and business intelligence for GHXSTSHIP'
    }
  };
}
