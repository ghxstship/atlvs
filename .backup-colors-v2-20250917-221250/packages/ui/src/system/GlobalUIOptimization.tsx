export interface UIStateConfig {
  theme: 'light' | 'dark';
  animations: boolean;
  accessibility: boolean;
}

export const atomicStates = {
  theme: 'light' as const,
  animations: true,
  accessibility: true,
};
