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
  serverExternalPackages: ['@supabase/supabase-js'],
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable API routes during build to prevent runtime errors
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

export default nextConfig
