import withPWA from 'next-pwa';

const experimentalConfig = {
  turbo: {},
  optimizeCss: true,
  instrumentationHook: true,
  serverComponentsExternalPackages: ['@supabase/supabase-js', '@sentry/node', '@sentry/nextjs'],
  disableOptimizedLoading: true,
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: experimentalConfig,
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable API routes during build to prevent runtime errors
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only packages in client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'node:child_process': false,
        'node:fs': false,
        'node:https': false,
        'node:http': false,
        'node:net': false,
        'node:tls': false,
        'node:crypto': false,
        'node:stream': false,
        'node:os': false,
      };
    }
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'ghxstship.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
}

// PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

export default pwaConfig(nextConfig)
