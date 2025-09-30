/**
 * Chart Theme Adapter
 * Provides theme integration for popular chart libraries
 */

import { useTheme } from '../providers/ThemeProvider';
import { SEMANTIC_TOKENS, DESIGN_TOKENS } from '../tokens/unified-design-tokens';

export interface ChartTheme {
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  tooltipBackground: string;
  tooltipText: string;
  colors: string[];
  fontFamily: string;
}

/**
 * Get chart theme based on current theme
 */
export function useChartTheme(): ChartTheme {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const semantic = isDark ? SEMANTIC_TOKENS.dark : SEMANTIC_TOKENS.light;

  return {
    backgroundColor: semantic.background,
    textColor: semantic.foreground,
    gridColor: semantic.border,
    tooltipBackground: semantic.popover,
    tooltipText: semantic.popoverForeground,
    colors: [
      DESIGN_TOKENS.colors.brand.primary[500],
      DESIGN_TOKENS.colors.brand.accent[500],
      DESIGN_TOKENS.colors.semantic.success[500],
      DESIGN_TOKENS.colors.semantic.warning[500],
      DESIGN_TOKENS.colors.semantic.info[500],
      DESIGN_TOKENS.colors.semantic.error[500],
      DESIGN_TOKENS.colors.gray[400],
      DESIGN_TOKENS.colors.gray[600],
    ],
    fontFamily: DESIGN_TOKENS.typography.fontFamily.body.join(', '),
  };
}

/**
 * Recharts theme configuration
 */
export function getRechartsTheme(theme: ChartTheme) {
  return {
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
    fontSize: 12,
    fontFamily: theme.fontFamily,
    grid: {
      stroke: theme.gridColor,
      strokeDasharray: '3 3',
    },
    axis: {
      stroke: theme.gridColor,
      tick: {
        fill: theme.textColor,
      },
      label: {
        fill: theme.textColor,
      },
    },
    tooltip: {
      backgroundColor: theme.tooltipBackground,
      color: theme.tooltipText,
      border: `1px solid ${theme.gridColor}`,
      borderRadius: '6px',
      padding: '8px 12px',
    },
    legend: {
      textColor: theme.textColor,
    },
    colors: theme.colors,
  };
}

/**
 * Chart.js theme configuration
 */
export function getChartJsTheme(theme: ChartTheme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.textColor,
          font: {
            family: theme.fontFamily,
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBackground,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        borderColor: theme.gridColor,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        font: {
          family: theme.fontFamily,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme.gridColor,
          borderColor: theme.gridColor,
        },
        ticks: {
          color: theme.textColor,
          font: {
            family: theme.fontFamily,
          },
        },
      },
      y: {
        grid: {
          color: theme.gridColor,
          borderColor: theme.gridColor,
        },
        ticks: {
          color: theme.textColor,
          font: {
            family: theme.fontFamily,
          },
        },
      },
    },
  };
}

/**
 * ApexCharts theme configuration
 */
export function getApexChartsTheme(theme: ChartTheme) {
  return {
    theme: {
      mode: theme.backgroundColor.includes('950') ? 'dark' : 'light',
    },
    chart: {
      background: theme.backgroundColor,
      foreColor: theme.textColor,
      fontFamily: theme.fontFamily,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    colors: theme.colors,
    grid: {
      borderColor: theme.gridColor,
      strokeDashArray: 3,
    },
    xaxis: {
      labels: {
        style: {
          colors: theme.textColor,
          fontFamily: theme.fontFamily,
        },
      },
      axisBorder: {
        color: theme.gridColor,
      },
      axisTicks: {
        color: theme.gridColor,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.textColor,
          fontFamily: theme.fontFamily,
        },
      },
    },
    tooltip: {
      theme: theme.backgroundColor.includes('950') ? 'dark' : 'light',
      style: {
        fontSize: '12px',
        fontFamily: theme.fontFamily,
      },
    },
    legend: {
      labels: {
        colors: theme.textColor,
      },
    },
  };
}

/**
 * D3.js theme configuration
 */
export function getD3Theme(theme: ChartTheme) {
  return {
    background: theme.backgroundColor,
    foreground: theme.textColor,
    grid: theme.gridColor,
    tooltip: {
      background: theme.tooltipBackground,
      text: theme.tooltipText,
      border: theme.gridColor,
    },
    colors: theme.colors,
    font: {
      family: theme.fontFamily,
      size: 12,
    },
    axis: {
      stroke: theme.gridColor,
      text: theme.textColor,
    },
  };
}

/**
 * Plotly theme configuration
 */
export function getPlotlyTheme(theme: ChartTheme) {
  return {
    layout: {
      paper_bgcolor: theme.backgroundColor,
      plot_bgcolor: theme.backgroundColor,
      font: {
        family: theme.fontFamily,
        size: 12,
        color: theme.textColor,
      },
      xaxis: {
        gridcolor: theme.gridColor,
        linecolor: theme.gridColor,
        tickcolor: theme.gridColor,
        tickfont: {
          color: theme.textColor,
        },
      },
      yaxis: {
        gridcolor: theme.gridColor,
        linecolor: theme.gridColor,
        tickcolor: theme.gridColor,
        tickfont: {
          color: theme.textColor,
        },
      },
      colorway: theme.colors,
    },
  };
}

/**
 * Victory (React Native) theme configuration
 */
export function getVictoryTheme(theme: ChartTheme) {
  return {
    axis: {
      style: {
        axis: {
          stroke: theme.gridColor,
        },
        axisLabel: {
          fill: theme.textColor,
          fontFamily: theme.fontFamily,
          fontSize: 12,
        },
        grid: {
          stroke: theme.gridColor,
          strokeDasharray: '3, 3',
        },
        ticks: {
          stroke: theme.gridColor,
        },
        tickLabels: {
          fill: theme.textColor,
          fontFamily: theme.fontFamily,
          fontSize: 10,
        },
      },
    },
    chart: {
      background: theme.backgroundColor,
    },
  };
}
