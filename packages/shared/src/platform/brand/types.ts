/**
 * Brand System Types
 * Complete TypeScript definitions for whitelabel branding
 */

export interface BrandRegistry {
  version: string;
  defaultBrand: string;
  brands: BrandMetadata[];
}

export interface BrandMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  domains: string[];
  enabled: boolean;
  isDefault: boolean;
}

export interface BrandConfiguration {
  version: string;
  brand: BrandInfo;
  theme: ThemeConfig;
  assets: AssetConfig;
  content: ContentConfig;
  features: FeatureConfig;
  seo: SEOConfig;
  metadata?: MetadataConfig;
}

export interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  website: string;
  support: SupportInfo;
  legal: LegalInfo;
}

export interface SupportInfo {
  email: string;
  phone: string;
  website: string;
}

export interface LegalInfo {
  company: string;
  address: string;
  termsUrl: string;
  privacyUrl: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto' | string;

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ColorSystem;
  typography: TypographySystem;
  spacing: SpacingSystem;
  borderRadius: BorderRadiusSystem;
  shadows: ShadowSystem;
}

export interface ColorSystem {
  brand: BrandColors;
  semantic: SemanticColors;
  neutral: NeutralColors;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface NeutralColors {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TypographySystem {
  fontFamily: FontFamilyConfig;
  fontSize: FontSizeConfig;
  fontWeight: FontWeightConfig;
}

export interface FontFamilyConfig {
  heading: string;
  body: string;
  mono: string;
}

export interface FontSizeConfig {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

export interface FontWeightConfig {
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  black?: number;
}

export interface SpacingSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface BorderRadiusSystem {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ShadowSystem {
  sm: string;
  base: string;
  md: string;
  lg: string;
}

export interface AssetConfig {
  logos: LogoSet;
  favicon: string;
  images: ImageSet;
  fonts?: FontDefinition[];
}

export interface LogoSet {
  primary: string;
  icon: string;
  wordmark: string;
}

export interface ImageSet {
  hero: string;
  auth: string;
  placeholder: string;
}

export interface FontDefinition {
  family: string;
  src: string;
  weight: number;
  style: string;
  cssVar?: string;
}

export interface ContentConfig {
  app: AppContent;
  navigation: NavigationLabels;
  terminology: TerminologyMap;
  marketing?: MarketingContent;
}

export interface AppContent {
  name: string;
  shortName: string;
  welcomeMessage: string;
  loginPrompt: string;
  signupPrompt: string;
}

export interface NavigationLabels {
  dashboard: string;
  projects: string;
  people: string;
  finance: string;
  assets: string;
  jobs: string;
  companies: string;
  programming: string;
  analytics: string;
  files: string;
  settings: string;
  profile: string;
}

export interface TerminologyMap {
  [key: string]: string;
}

export interface MarketingContent {
  hero?: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  features?: Array<{
    title: string;
    description: string;
  }>;
}

export interface FeatureConfig {
  modules: ModuleFlags;
  integrations?: IntegrationFlags;
  customization?: CustomizationFlags;
}

export interface ModuleFlags {
  dashboard: boolean;
  projects: boolean;
  people: boolean;
  finance: boolean;
  assets: boolean;
  jobs: boolean;
  companies: boolean;
  programming: boolean;
  analytics: boolean;
  files: boolean;
  settings: boolean;
  profile: boolean;
}

export interface IntegrationFlags {
  [key: string]: boolean;
}

export interface CustomizationFlags {
  [key: string]: boolean;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterHandle?: string;
}

export interface MetadataConfig {
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  author?: string;
}
