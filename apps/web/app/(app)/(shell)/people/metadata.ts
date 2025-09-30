import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('people');

  return {
    title: t('title') || 'Team Management',
    description: t('description') || 'Manage team members, roles, and organizational structure for GHXSTSHIP',
    keywords: ['people', 'team', 'members', 'organization', 'roles', 'management', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Team Management',
      description: t('description') || 'Manage team members, roles, and organizational structure for GHXSTSHIP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Team Management',
      description: t('description') || 'Manage team members, roles, and organizational structure for GHXSTSHIP',
    },
  };
}
