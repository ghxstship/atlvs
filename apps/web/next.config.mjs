const experimentalConfig = {
  optimizeCss: true,
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
  turbopack: {},
  serverExternalPackages: [
    '@supabase/supabase-js',
    '@sentry/nextjs',
    '@sentry/node',
    '@opentelemetry/instrumentation',
    '@opentelemetry/api',
  ],
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

export default nextConfig
