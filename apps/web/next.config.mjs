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
    if (nextRuntime === 'edge') {
      // Exclude realtime-js and other Node.js-only Supabase dependencies
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /@supabase\/realtime-js/,
          require.resolve('./lib/edge-runtime-stubs.js')
        )
      );
      
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /@supabase\/node-fetch/,
          'node-fetch'
        )
      );
      
      // Provide necessary environment polyfills
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        })
      );
      
      // Mark problematic modules as external for Edge Runtime
      config.externals = config.externals || [];
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      config.externals.push({
        '@supabase/realtime-js': 'commonjs @supabase/realtime-js',
      });
    }
    
    return config;
  },
}

export default nextConfig
