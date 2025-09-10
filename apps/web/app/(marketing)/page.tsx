import type { Metadata } from 'next';
import Link from 'next/link';
import { typography } from './lib/typography';

export const metadata: Metadata = {
  title: 'GHXSTSHIP - Production Management That Actually Works',
  description: 'Stop drowning in spreadsheets and Slack chaos. ATLVS and OPENDECK help you manage productions like a pro without losing your sanity (or your budget).',
  openGraph: {
    title: 'GHXSTSHIP - Production Management That Actually Works',
    description: 'Stop drowning in spreadsheets and Slack chaos. ATLVS and OPENDECK help you manage productions like a pro without losing your sanity.',
    url: 'https://ghxstship.com',
  },
};

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 mr-2">
                  New
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                  ATLVS 2.0 just dropped with AI that actually helps
                </span>
              </div>
            </div>
            <h1 className={`mb-6 text-slate-900 ${typography.heroTitle}`}>
              PRODUCTION MANAGEMENT
              <br />
              THAT DOESN'T SUCK
            </h1>
            <p className={`mx-auto mb-8 max-w-2xl ${typography.heroSubtitle}`}>
              Finally, production tools built by people who've actually managed real productions. 
              No more juggling 47 different apps or crying into spreadsheets at 2 AM.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link href="/login" className="rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 whitespace-nowrap">
                Get Started Free →
              </Link>
              <Link href="/products" className="rounded-md border border-slate-300 px-6 py-3 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 whitespace-nowrap">
                ▶ Watch Demo
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6 text-sm">
              <div className="flex items-center gap-x-2">
                <span className="text-green-500">✓</span>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-x-2">
                <span className="text-green-500">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-x-2">
                <span className="text-green-500">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-4">
                Our Products
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 mb-6">
                Used by 10K+ teams who got tired of production chaos
              </span>
              <h2 className={`mb-4 text-slate-900 ${typography.sectionTitle}`}>
                TWO PRODUCTS THAT ACTUALLY WORK TOGETHER
              </h2>
              <p className={typography.sectionSubtitle}>
                Manage your projects with ATLVS, find talent and assets on OPENDECK. 
                It's like having a production assistant who never calls in sick.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* ATLVS Card */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">ATLVS</span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Project Management</span>
                    </div>
                    <div className="mb-6">
                      <div className="mb-4 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xl">⚡</span>
                      </div>
                      <h3 className={`mb-2 text-slate-900 ${typography.cardTitle}`}>
                        PROJECT MANAGEMENT FOR REAL HUMANS
                      </h3>
                      <p className={typography.bodyMedium}>
                        Track everything from crew schedules to budget burns without wanting to throw your laptop out the window. 
                        Built by someone who's managed $15M+ in productions.
                      </p>
                    </div>
                    <ul className="mb-6 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">AI-powered project insights</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Real-time team collaboration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Advanced reporting & analytics</span>
                      </li>
                    </ul>
                    <Link href="/products/atlvs" className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 whitespace-nowrap">
                      Explore ATLVS →
                    </Link>
                  </div>
                </div>

                {/* OPENDECK Card */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">OPENDECK</span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Asset Marketplace</span>
                    </div>
                    <div className="mb-6">
                      <div className="mb-4 h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                        <span className="text-white text-xl">🌐</span>
                      </div>
                      <h3 className={`mb-2 text-slate-900 ${typography.cardTitle}`}>
                        TALENT & ASSETS THAT DON'T GHOST YOU
                      </h3>
                      <p className={typography.bodyMedium}>
                        Find verified crew, book reliable vendors, and source assets from people who actually show up. 
                        No more last-minute "sorry, can't make it" texts.
                      </p>
                    </div>
                    <ul className="mb-6 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Millions of premium assets</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Global talent network</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Secure licensing & payments</span>
                      </li>
                    </ul>
                    <Link href="/products/opendeck" className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 whitespace-nowrap">
                      Explore OPENDECK →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white shadow-xl">
              <h2 className={`mb-4 text-white ${typography.sectionTitle}`}>
                READY TO STOP PRODUCTION CHAOS?
              </h2>
              <p className={`mb-8 opacity-90 ${typography.heroSubtitle}`}>
                Join 10K+ production pros who switched from spreadsheet hell to actually getting stuff done. 
                Your future self will thank you.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/login" className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-slate-50 whitespace-nowrap">
                  Start Free Trial →
                </Link>
                <Link href="/contact" className="rounded-md border border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10 whitespace-nowrap">
                  Contact Sales
                </Link>
                <Link href="/pricing" className="rounded-md border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 whitespace-nowrap">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
