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
  webpack: (config, { webpack, nextRuntime, isServer }) => {
    // For Edge Runtime: completely exclude realtime-js since it uses Node.js APIs
    // and is NOT used in middleware (middleware only uses auth.getSession())
    if (nextRuntime === 'edge' && isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /@supabase\/realtime-js/,
          contextRegExp: /./,
        })
      );
      
      // Provide process polyfills for Edge Runtime compatibility with Supabase
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'process.version': JSON.stringify('v18.0.0'),
          'process.versions': JSON.stringify({ node: '18.0.0' }),
        })
      );
    }
    
    return config;
  },
}

export default nextConfig
