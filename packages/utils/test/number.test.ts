import { describe, it, expect } from 'vitest';

describe('smoke math', () => {
  const sum = (a: number, b: number) => a + b;
  const clamp = (value: number, min: number, max: number) => {
    if (min > max) throw new Error('min must be <= max');
    return Math.min(Math.max(value, min), max);
  };
  const isEven = (n: number) => n % 2 === 0;

  it('sum adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
    expect(sum(-1, 1)).toBe(0);
  });

  it('clamp returns value within [min, max]', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('clamp throws when min > max', () => {
    expect(() => clamp(1, 5, 1)).toThrow('min must be <= max');
  });

  it('isEven determines evenness', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isEven(0)).toBe(true);
  });
});
