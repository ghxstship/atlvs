import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('companies');

  return {
    title: t('title') || 'Company Directory',
    description: t('description') || 'Manage company relationships, contacts, and partnerships for GHXSTSHIP',
    keywords: ['companies', 'directory', 'contacts', 'partnerships', 'relationships', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Company Directory',
      description: t('description') || 'Manage company relationships, contacts, and partnerships for GHXSTSHIP',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Company Directory',
      description: t('description') || 'Manage company relationships, contacts, and partnerships for GHXSTSHIP'
    }
  };
}
