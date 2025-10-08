/**
 * Class Name Utility
 * Merge class names with conditional support
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassObject = Record<string, boolean>;

/**
 * Merge class names
 */
export function cn(...inputs: (ClassValue | ClassArray | ClassObject)[]): string {
  const classes: string[] = [];

  inputs.forEach((input) => {
    if (!input) return;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      Object.entries(input).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });

  return classes.join(' ');
}
