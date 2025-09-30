import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'he'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Custom pathnames for specific routes
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/projects': '/projects',
    '/people': '/people',
    '/companies': '/companies',
    '/finance': '/finance',
    '/jobs': '/jobs',
    '/procurement': '/procurement',
    '/programming': '/programming',
    '/analytics': '/analytics',
    '/settings': '/settings',
    '/profile': '/profile'
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
