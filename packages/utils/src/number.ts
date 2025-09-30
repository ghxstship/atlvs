export function sum(a: number, b: number): number {
  return a + b;
}

export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new Error('min must be <= max');
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function isEven(n: number): boolean {
  return n % 2 === 0;
}
