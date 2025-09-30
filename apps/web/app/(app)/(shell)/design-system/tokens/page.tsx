/**
 * Design Token Documentation Page
 * Visual browser for all design tokens
 */

import { Metadata } from 'next';
import { TokenBrowser } from './TokenBrowser';

export const metadata: Metadata = {
  title: 'Design Tokens | GHXSTSHIP',
  description: 'Browse and search all design system tokens',
};

export default function DesignTokensPage() {
  return <TokenBrowser />;
}
