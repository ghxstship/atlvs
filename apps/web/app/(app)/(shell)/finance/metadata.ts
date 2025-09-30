import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('finance');

  return {
    title: t('title') || 'Financial Management',
    description: t('description') || 'Manage budgets, expenses, invoices, and financial reporting for GHXSTSHIP',
    keywords: ['finance', 'budgeting', 'expenses', 'invoices', 'reporting', 'GHXSTSHIP'],
    openGraph: {
      title: t('title') || 'Financial Management',
      description: t('description') || 'Manage budgets, expenses, invoices, and financial reporting for GHXSTSHIP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') || 'Financial Management',
      description: t('description') || 'Manage budgets, expenses, invoices, and financial reporting for GHXSTSHIP',
    },
  };
}
