/**
 * Third-Party Theme Integration Utilities
 * Provides theme adapters for popular third-party libraries
 */

import { useTheme } from '../providers/ThemeProvider';
import { SEMANTIC_TOKENS } from '../tokens/unified-design-tokens';

/**
 * Get semantic colors for current theme
 */
export function useSemanticColors() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  return isDark ? SEMANTIC_TOKENS.dark : SEMANTIC_TOKENS.light;
}

/**
 * AG Grid theme configuration
 */
export function useAgGridTheme() {
  const colors = useSemanticColors();

  return {
    theme: colors.background.includes('950') ? 'ag-theme-alpine-dark' : 'ag-theme-alpine',
    customTheme: {
      '--ag-background-color': colors.background,
      '--ag-foreground-color': colors.foreground,
      '--ag-header-background-color': colors.card,
      '--ag-header-foreground-color': colors.cardForeground,
      '--ag-odd-row-background-color': colors.background,
      '--ag-row-hover-color': colors.muted,
      '--ag-selected-row-background-color': colors.accent,
      '--ag-border-color': colors.border,
      '--ag-input-border-color': colors.input,
      '--ag-input-focus-border-color': colors.ring,
    },
  };
}

/**
 * React Table theme configuration
 */
export function useReactTableTheme() {
  const colors = useSemanticColors();

  return {
    table: {
      backgroundColor: colors.background,
      color: colors.foreground,
      borderColor: colors.border,
    },
    header: {
      backgroundColor: colors.card,
      color: colors.cardForeground,
      borderColor: colors.border,
    },
    row: {
      backgroundColor: colors.background,
      hoverBackgroundColor: colors.muted,
      selectedBackgroundColor: colors.accent,
      borderColor: colors.border,
    },
    cell: {
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
    },
  };
}

/**
 * React Select theme configuration
 */
export function useReactSelectTheme() {
  const colors = useSemanticColors();

  return {
    control: (base: any) => ({
      ...base,
      backgroundColor: colors.background,
      borderColor: colors.input,
      '&:hover': {
        borderColor: colors.ring,
      },
      '&:focus-within': {
        borderColor: colors.ring,
        boxShadow: `0 0 0 1px ${colors.ring}`,
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: colors.popover,
      border: `1px solid ${colors.border}`,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? colors.primary
        : state.isFocused
        ? colors.muted
        : 'transparent',
      color: state.isSelected ? colors.primaryForeground : colors.foreground,
      '&:hover': {
        backgroundColor: colors.muted,
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: colors.foreground,
    }),
    input: (base: any) => ({
      ...base,
      color: colors.foreground,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: colors.mutedForeground,
    }),
  };
}

/**
 * React Datepicker theme configuration
 */
export function useReactDatepickerTheme() {
  const colors = useSemanticColors();

  return {
    '--rdp-background-color': colors.background,
    '--rdp-accent-color': colors.primary,
    '--rdp-accent-color-dark': colors.primary,
    '--rdp-background-color-dark': colors.card,
    '--rdp-outline': colors.ring,
    '--rdp-outline-selected': colors.ring,
  };
}

/**
 * React Toastify theme configuration
 */
export function useReactToastifyTheme() {
  const colors = useSemanticColors();

  return {
    '--toastify-color-light': colors.background,
    '--toastify-color-dark': colors.card,
    '--toastify-color-info': colors.info,
    '--toastify-color-success': colors.success,
    '--toastify-color-warning': colors.warning,
    '--toastify-color-error': colors.destructive,
    '--toastify-text-color-light': colors.foreground,
    '--toastify-text-color-dark': colors.foreground,
  };
}

/**
 * React Modal theme configuration
 */
export function useReactModalTheme() {
  const colors = useSemanticColors();

  return {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    },
    content: {
      backgroundColor: colors.card,
      color: colors.cardForeground,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      padding: '1.5rem',
    },
  };
}

/**
 * React DnD (Drag and Drop) theme configuration
 */
export function useReactDndTheme() {
  const colors = useSemanticColors();

  return {
    dragging: {
      opacity: 0.5,
      cursor: 'grabbing',
    },
    dropzone: {
      backgroundColor: colors.muted,
      border: `2px dashed ${colors.border}`,
      borderRadius: '0.5rem',
    },
    dropzoneActive: {
      backgroundColor: colors.accent,
      borderColor: colors.primary,
    },
  };
}

/**
 * Framer Motion theme configuration
 */
export function useFramerMotionTheme() {
  const colors = useSemanticColors();

  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
    colors: {
      primary: colors.primary,
      accent: colors.accent,
      background: colors.background,
      foreground: colors.foreground,
    },
  };
}

/**
 * Leaflet (Maps) theme configuration
 */
export function useLeafletTheme() {
  const colors = useSemanticColors();

  return {
    tileLayer: colors.background.includes('950')
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    markerColor: colors.primary,
    popupBackground: colors.popover,
    popupColor: colors.popoverForeground,
  };
}

/**
 * FullCalendar theme configuration
 */
export function useFullCalendarTheme() {
  const colors = useSemanticColors();

  return {
    '--fc-bg-event': colors.primary,
    '--fc-border-color': colors.border,
    '--fc-button-bg-color': colors.primary,
    '--fc-button-border-color': colors.primary,
    '--fc-button-hover-bg-color': colors.accent,
    '--fc-button-hover-border-color': colors.accent,
    '--fc-button-active-bg-color': colors.accent,
    '--fc-button-active-border-color': colors.accent,
    '--fc-event-bg-color': colors.primary,
    '--fc-event-border-color': colors.primary,
    '--fc-event-text-color': colors.primaryForeground,
    '--fc-page-bg-color': colors.background,
    '--fc-neutral-bg-color': colors.muted,
    '--fc-neutral-text-color': colors.mutedForeground,
    '--fc-today-bg-color': colors.accent,
  };
}

/**
 * Tiptap (Rich Text Editor) theme configuration
 */
export function useTiptapTheme() {
  const colors = useSemanticColors();

  return {
    '.ProseMirror': {
      backgroundColor: colors.background,
      color: colors.foreground,
      padding: '1rem',
      minHeight: '200px',
      outline: 'none',
    },
    '.ProseMirror p': {
      margin: '0.5rem 0',
    },
    '.ProseMirror h1, .ProseMirror h2, .ProseMirror h3': {
      color: colors.foreground,
      fontWeight: 'bold',
    },
    '.ProseMirror code': {
      backgroundColor: colors.muted,
      color: colors.mutedForeground,
      padding: '0.125rem 0.25rem',
      borderRadius: '0.25rem',
    },
    '.ProseMirror pre': {
      backgroundColor: colors.card,
      color: colors.cardForeground,
      padding: '1rem',
      borderRadius: '0.5rem',
      overflow: 'auto',
    },
  };
}

/**
 * React Hook Form theme configuration
 */
export function useReactHookFormTheme() {
  const colors = useSemanticColors();

  return {
    input: {
      backgroundColor: colors.background,
      color: colors.foreground,
      borderColor: colors.input,
      '&:focus': {
        borderColor: colors.ring,
        outline: `2px solid ${colors.ring}`,
        outlineOffset: '2px',
      },
    },
    error: {
      color: colors.destructive,
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
    label: {
      color: colors.foreground,
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem',
    },
  };
}

/**
 * Generic third-party component theme wrapper
 */
export function createThirdPartyTheme(
  library: 'ag-grid' | 'react-table' | 'react-select' | 'datepicker' | 'toastify' | 'modal' | 'dnd' | 'framer' | 'leaflet' | 'fullcalendar' | 'tiptap' | 'react-hook-form'
) {
  const hooks = {
    'ag-grid': useAgGridTheme,
    'react-table': useReactTableTheme,
    'react-select': useReactSelectTheme,
    'datepicker': useReactDatepickerTheme,
    'toastify': useReactToastifyTheme,
    'modal': useReactModalTheme,
    'dnd': useReactDndTheme,
    'framer': useFramerMotionTheme,
    'leaflet': useLeafletTheme,
    'fullcalendar': useFullCalendarTheme,
    'tiptap': useTiptapTheme,
    'react-hook-form': useReactHookFormTheme,
  };

  return hooks[library];
}
