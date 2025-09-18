// Component Architecture Framework
export {
  BaseComponent,
  useComponentLifecycle,
  withBaseComponent,
  ComponentRegistry,
  ComponentInspector
} from './ComponentBase';

export {
  DataFetchingComponent,
  FormComponent,
  ListComponent,
  ModalComponent,
  useDataFetching,
  useForm
} from './ComponentPatterns';

export {
  DesignTokens,
  ComponentSizes,
  ComponentVariants,
  AccessibilityStandards,
  CompositionPatterns,
  DesignSystemGuide
} from './DesignSystem';

// Types
export type {
  BaseComponentProps,
  BaseComponentState,
  ComponentLifecycle,
  PerformanceMetrics,
  ComponentMetadata,
  FunctionalComponentProps,
  DataFetchingProps,
  DataFetchingState,
  FormProps,
  FormState,
  ListProps,
  ModalProps,
  CompositionPattern
} from './ComponentBase';

export type {
  DataFetchingProps as DataFetchingComponentProps,
  DataFetchingState as DataFetchingComponentState,
  FormProps as FormComponentProps,
  FormState as FormComponentState
} from './ComponentPatterns';
