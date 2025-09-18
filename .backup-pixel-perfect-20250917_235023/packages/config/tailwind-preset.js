/** JS runtime version of Tailwind preset for Node-based config loaders */
const preset = {
  content: [],
  theme: {
    extend: {
      borderRadius: {
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)'
      },
      colors: {
        background: 'hsl(var(--background, 0 0% 100%))',
        foreground: 'hsl(var(--foreground, 0 0% 7%))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 1px rgba(0,0,0,0.05)',
        elevated: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
      },
    },
  },
  plugins: [],
};
module.exports = preset;
