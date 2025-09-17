/**
 * Utility function for merging class names
 * This is a local implementation to avoid import issues with the UI package
 */
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
