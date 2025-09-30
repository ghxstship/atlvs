/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  
  // Optimize bundle size
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@ghxstship/ui',
      '@ghxstship/auth',
      '@ghxstship/domain',
      '@ghxstship/application',
      'lucide-react',
      '@tanstack/react-table',
      '@tanstack/react-virtual',
      'react-hook-form',
      'zod'
    ],
    turbo: {
      resolveAlias: {
        '@': './apps/web',
        '@ghxstship/ui': './packages/ui/src',
        '@ghxstship/auth': './packages/auth/src',
        '@ghxstship/domain': './packages/domain/src',
        '@ghxstship/application': './packages/application/src',
      },
    },
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid$'],
    } : false,
  },

  // Image optimization
  images: {
    domains: ['localhost', 'ghxstship.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Code splitting strategy
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 244000, // 244KB max chunk size
          cacheGroups: {
            default: false,
            vendors: false,
            
            // Framework chunks
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
              priority: 40,
              enforce: true,
            },
            
            // Library chunks
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[\\/]/.test(module.identifier());
              },
              name(module) {
                const hash = require('crypto')
                  .createHash('sha1')
                  .update(module.identifier())
                  .digest('hex')
                  .substring(0, 8);
                return `lib-${hash}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            
            // Commons chunk
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            
            // Shared modules
            shared: {
              name(module, chunks) {
                const hash = require('crypto')
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8);
                return `shared-${hash}`;
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
            
            // UI components
            ui: {
              name: 'ui',
              test: /[\\/]packages[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 35,
              reuseExistingChunk: true,
            },
            
            // Supabase client
            supabase: {
              name: 'supabase',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              chunks: 'all',
              priority: 35,
              reuseExistingChunk: true,
            },
            
            // Form libraries
            forms: {
              name: 'forms',
              test: /[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,
              chunks: 'all',
              priority: 34,
              reuseExistingChunk: true,
            },
            
            // Data visualization
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              chunks: 'async',
              priority: 33,
              reuseExistingChunk: true,
            },
            
            // Icons
            icons: {
              name: 'icons',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              chunks: 'all',
              priority: 32,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Minimize bundle
      config.optimization.minimize = true;
      
      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Module concatenation
      config.optimization.concatenateModules = true;
    }

    // Alias for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './apps/web',
      '@ui': './packages/ui/src',
      '@auth': './packages/auth/src',
      '@domain': './packages/domain/src',
      '@application': './packages/application/src',
    };

    // Ignore unnecessary files
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader',
    });

    return config;
  },

  // Headers for security and performance with CSP nonces
  async headers() {
    const nonce = crypto.randomBytes(16).toString('base64');

    return [
      {
        source: '/(.*)',
        headers: [
          // HTTPS and TLS Security Headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Forwarded-Proto',
            value: 'https',
          },

          // Content Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // Enhanced Content Security Policy with HTTPS enforcement
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'strict-dynamic' 'nonce-" + nonce + "' https://*.supabase.co https://*.posthog.com https://*.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Keep unsafe-inline for fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://*.supabase.co https://*.ghxstship.com https://ghxstship.com",
              "connect-src 'self' https://*.supabase.co https://*.posthog.com https://*.google-analytics.com wss://*.supabase.co",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests" // Force HTTP to HTTPS upgrades
            ].join('; '),
          },

          // Nonce for CSP
          {
            key: 'X-Nonce',
            value: nonce,
          },
        ],
      },

      // API routes - additional security
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Redirects for old routes
  async redirects() {
    return [
      {
        source: '/profile/overview',
        destination: '/profile',
        permanent: true,
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Output configuration
  output: 'standalone',

  // Disable x-powered-by header
  poweredByHeader: false,
};
