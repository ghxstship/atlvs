/**
 * GHXSTSHIP UI Performance Configuration
 * Bundle optimization and performance settings
 */

module.exports = {
  // Bundle splitting configuration
  bundleSplitting: {
    // Core components that should be in main bundle
    core: [
      'Button',
      'Input',
      'Card',
      'Badge',
    ],
    
    // Heavy components that should be lazy loaded
    lazy: [
      'DataTable',
      'Chart',
      'Calendar',
      'RichTextEditor',
    ],
    
    // Utility functions
    utils: [
      'cn',
      'getToken',
      'generateCSSVariables',
    ],
  },

  // Tree shaking configuration
  treeShaking: {
    sideEffects: false,
    usedExports: true,
    providedExports: true,
  },

  // CSS optimization
  css: {
    // Critical CSS that should be inlined
    critical: [
      'reset',
      'base',
      'typography',
      'layout',
    ],
    
    // CSS that can be loaded asynchronously
    async: [
      'animations',
      'themes',
      'utilities',
    ],
    
    // Purge unused CSS
    purge: {
      enabled: true,
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './stories/**/*.{js,jsx,ts,tsx}',
      ],
      safelist: [
        // Classes that might be generated dynamically
        /^btn-/,
        /^text-/,
        /^bg-/,
        /^border-/,
        /^shadow-/,
      ],
    },
  },

  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    sizes: [16, 32, 48, 64, 96, 128, 256, 384],
    quality: 85,
    progressive: true,
  },

  // Font optimization
  fonts: {
    preload: [
      'ANTON-400.woff2',
      'ShareTech-400.woff2',
      'ShareTechMono-400.woff2',
    ],
    display: 'swap',
    fallbacks: {
      'ANTON': ['Arial Black', 'Arial', 'sans-serif'],
      'Share Tech': ['Helvetica', 'Arial', 'sans-serif'],
      'Share Tech Mono': ['Consolas', 'Monaco', 'monospace'],
    },
  },

  // JavaScript optimization
  javascript: {
    // Babel configuration for optimal output
    babel: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead'],
          },
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
        }],
        ['@babel/preset-react', {
          runtime: 'automatic',
        }],
        '@babel/preset-typescript',
      ],
      plugins: [
        // Remove development-only code
        ['babel-plugin-transform-remove-console', {
          exclude: ['error', 'warn'],
        }],
        // Optimize React
        ['babel-plugin-transform-react-remove-prop-types', {
          mode: 'remove',
          removeImport: true,
        }],
      ],
    },

    // Terser configuration for minification
    terser: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
      output: {
        comments: false,
      },
    },
  },

  // Performance budgets
  budgets: {
    // Bundle size limits
    bundles: {
      core: '50kb',
      vendor: '150kb',
      total: '250kb',
    },
    
    // Asset size limits
    assets: {
      images: '500kb',
      fonts: '100kb',
      css: '50kb',
    },
    
    // Runtime performance
    runtime: {
      firstContentfulPaint: '1.5s',
      largestContentfulPaint: '2.5s',
      cumulativeLayoutShift: '0.1',
      firstInputDelay: '100ms',
    },
  },

  // Monitoring and analytics
  monitoring: {
    // Web Vitals tracking
    webVitals: true,
    
    // Bundle analysis
    bundleAnalyzer: {
      enabled: process.env.ANALYZE === 'true',
      openAnalyzer: false,
      generateStatsFile: true,
    },
    
    // Performance tracking
    performance: {
      marks: [
        'component-mount',
        'theme-load',
        'tokens-parse',
      ],
      measures: [
        'app-startup',
        'theme-switch',
        'component-render',
      ],
    },
  },

  // Development optimizations
  development: {
    // Hot module replacement
    hmr: true,
    
    // Fast refresh for React
    fastRefresh: true,
    
    // Source maps
    sourceMaps: 'eval-source-map',
    
    // Development server
    devServer: {
      compress: true,
      hot: true,
      overlay: true,
    },
  },

  // Production optimizations
  production: {
    // Code splitting
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    
    // Compression
    compression: {
      gzip: true,
      brotli: true,
      threshold: 8192,
    },
    
    // Caching
    caching: {
      hashFunction: 'xxhash64',
      hashDigest: 'hex',
      hashDigestLength: 8,
    },
  },
};
