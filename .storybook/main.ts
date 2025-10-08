import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../apps/web/app/_components/marketing/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/ui/src/atoms/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/ui/src/molecules/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/ui/src/organisms/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/ui/src/layout/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/ui/src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  staticDirs: ['../public'],
};

export default config;
