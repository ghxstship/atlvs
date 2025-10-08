import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('programming');

  return {
    title: t('title') || 'Programming Calendar',
    description: t('description') || 'Manage your programming calendar, events, and scheduling for GHXSTSHIP',
    keywords: ['programming', 'calendar', 'events', 'scheduling', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Programming Calendar',
      description: t('description') || 'Manage your programming calendar, events, and scheduling for GHXSTSHIP',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Programming Calendar',
      description: t('description') || 'Manage your programming calendar, events, and scheduling for GHXSTSHIP'
    }
  };
}
