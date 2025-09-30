import { describe, it, expect } from '@jest/globals'

describe('Example Unit Test', () => {
  it('should pass basic assertion', () => {
    expect(true).toBe(true)
  })

  it('should perform arithmetic correctly', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })
})

describe('Array Operations', () => {
  it('should filter array correctly', () => {
    const numbers = [1, 2, 3, 4, 5]
    const evens = numbers.filter(n => n % 2 === 0)
    expect(evens).toEqual([2, 4])
  })

  it('should map array correctly', () => {
    const numbers = [1, 2, 3]
    const doubled = numbers.map(n => n * 2)
    expect(doubled).toEqual([2, 4, 6])
  })
})

describe('Object Operations', () => {
  it('should merge objects correctly', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { b: 3, c: 4 }
    const merged = { ...obj1, ...obj2 }
    expect(merged).toEqual({ a: 1, b: 3, c: 4 })
  })
})
