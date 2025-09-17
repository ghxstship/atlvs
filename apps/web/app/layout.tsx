import './globals.css';
import type { Metadata } from 'next';
import { Anton, Share_Tech, Share_Tech_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import { WebVitals } from './web-vitals';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });
const shareTech = Share_Tech({ weight: '400', subsets: ['latin'], variable: '--font-body' });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'GHXSTSHIP Platform',
  description: 'ATLVS + OPENDECK + GHXSTSHIP',
  metadataBase: new URL('https://ghxstship.com'),
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Determine subdomain from host for brand theming
  const host = headers().get('host') || '';
  const hostname = host.split(':')[0];
  let subdomain = '';
  const parts = hostname.split('.');
  if (parts.length > 2) {
    subdomain = parts[0];
  } else if (parts.length === 2 && parts[0] !== 'localhost') {
    subdomain = parts[0];
  }

  // Map subdomain to brand identifier for CSS variables
  const brand = ['atlvs', 'opendeck', 'ghxstship'].includes(subdomain) ? subdomain : 'ghxstship';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${shareTech.className} ${shareTech.variable} ${shareTechMono.variable} ${anton.variable}`} data-brand={brand}>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
