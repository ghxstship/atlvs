/**
 * Dynamic Style Utilities
 * Zero Tolerance: CSS Variables for Runtime-Calculated Values
 * 
 * Use these utilities instead of inline styles for dynamic values
 */

import type { CSSProperties } from 'react';

/**
 * Chart Height Style
 * For charts that need dynamic height based on container
 */
export const getChartHeightStyle = (
  height: number,
  offset: number = 120
): CSSProperties => ({
  '--chart-height': `${height - offset}px`,
} as CSSProperties);

/**
 * Chart Color Style
 * For series colors with fallback to generated HSL
 */
export const getSeriesColorStyle = (
  color?: string,
  index: number = 0,
  total: number = 1
): CSSProperties => ({
  '--series-color':
    color || `hsl(${(index * 360) / total}, 70%, 50%)`,
} as CSSProperties);

/**
 * Dynamic Position Style
 * For elements that need runtime-calculated positioning
 */
export const getPositionStyle = (
  x?: number,
  y?: number,
  unit: 'px' | '%' | 'rem' = 'px'
): CSSProperties => {
  const style: Record<string, string> = {};
  if (x !== undefined) style['--pos-x'] = `${x}${unit}`;
  if (y !== undefined) style['--pos-y'] = `${y}${unit}`;
  return style as CSSProperties;
};

/**
 * Dynamic Size Style
 * For elements with runtime-calculated width/height
 */
export const getDynamicSizeStyle = (
  width?: number,
  height?: number,
  unit: 'px' | '%' | 'rem' = 'px'
): CSSProperties => {
  const style: Record<string, string> = {};
  if (width !== undefined) style['--dynamic-width'] = `${width}${unit}`;
  if (height !== undefined) style['--dynamic-height'] = `${height}${unit}`;
  return style as CSSProperties);
};

/**
 * Dynamic Color Style
 * For elements with runtime-calculated colors
 */
export const getDynamicColorStyle = (
  bg?: string,
  text?: string,
  border?: string
): CSSProperties => {
  const style: Record<string, string> = {};
  if (bg) style['--dynamic-bg'] = bg;
  if (text) style['--dynamic-text'] = text;
  if (border) style['--dynamic-border'] = border;
  return style as CSSProperties;
};

/**
 * Grid Position Style
 * For CSS Grid with dynamic positioning
 */
export const getGridPositionStyle = (
  row?: number,
  column?: number,
  rowSpan?: number,
  columnSpan?: number
): CSSProperties => {
  const style: Record<string, string> = {};
  if (row !== undefined) style['--grid-row'] = `${row}`;
  if (column !== undefined) style['--grid-column'] = `${column}`;
  if (rowSpan !== undefined) style['--grid-row-span'] = `${rowSpan}`;
  if (columnSpan !== undefined) style['--grid-column-span'] = `${columnSpan}`;
  return style as CSSProperties;
};

/**
 * Transform Style
 * For elements with dynamic transforms
 */
export const getTransformStyle = (
  translateX?: number,
  translateY?: number,
  rotate?: number,
  scale?: number
): CSSProperties => {
  const transforms: string[] = [];
  if (translateX !== undefined) transforms.push(`translateX(${translateX}px)`);
  if (translateY !== undefined) transforms.push(`translateY(${translateY}px)`);
  if (rotate !== undefined) transforms.push(`rotate(${rotate}deg)`);
  if (scale !== undefined) transforms.push(`scale(${scale})`);
  
  return {
    '--transform': transforms.join(' '),
    transform: transforms.join(' '),
  } as CSSProperties;
};

/**
 * Opacity/Visibility Style
 * For elements with dynamic opacity
 */
export const getVisibilityStyle = (
  opacity?: number,
  visible: boolean = true
): CSSProperties => ({
  '--opacity': opacity !== undefined ? `${opacity}` : undefined,
  opacity: opacity,
  visibility: visible ? 'visible' : 'hidden',
} as CSSProperties);

/**
 * Z-Index Style
 * For elements with dynamic stacking
 */
export const getZIndexStyle = (zIndex: number): CSSProperties => ({
  '--z-index': `${zIndex}`,
  zIndex,
} as CSSProperties);

/**
 * Combine Multiple Styles
 * Utility to merge multiple style objects
 */
export const combineStyles = (...styles: CSSProperties[]): CSSProperties =>
  Object.assign({}, ...styles);

/**
 * Example Usage:
 * 
 * // Chart with dynamic height
 * <div
 *   className="h-[var(--chart-height)]"
 *   style={getChartHeightStyle(containerHeight, 120)}
 * />
 * 
 * // Series with dynamic color
 * <div
 *   className="bg-[var(--series-color)]"
 *   style={getSeriesColorStyle(series.color, index, total)}
 * />
 * 
 * // Element with multiple dynamic values
 * <div
 *   className="w-[var(--dynamic-width)] h-[var(--dynamic-height)]"
 *   style={getDynamicSizeStyle(width, height)}
 * />
 * 
 * // Combined styles
 * <div
 *   className="w-[var(--dynamic-width)] bg-[var(--dynamic-bg)]"
 *   style={combineStyles(
 *     getDynamicSizeStyle(width, height),
 *     getDynamicColorStyle(bgColor, textColor)
 *   )}
 * />
 */

export default {
  getChartHeightStyle,
  getSeriesColorStyle,
  getPositionStyle,
  getDynamicSizeStyle,
  getDynamicColorStyle,
  getGridPositionStyle,
  getTransformStyle,
  getVisibilityStyle,
  getZIndexStyle,
  combineStyles,
};
