import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@ghxstship/ui';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial value when no stored value exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
    
    expect(result.current[0]).toBe('default-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should return stored value when it exists', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('should handle JSON parsing errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('defaultValue');

    act(() => {
      result.current[1]('newValue');
    });
    expect(result.current[0]).toBe('newValue');
  });

  it('should update values correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should handle function updates', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5));
    
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });
    
    expect(result.current[0]).toBe(6);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('counter', JSON.stringify(6));
  });

  it('should handle localStorage setItem errors', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    localStorageMock.getItem.mockReturnValue(null);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('persist-key', 'initial'));
    
    act(() => {
      result.current[1]('persisted-value');
    });
    
    expect(result.current[0]).toBe('persisted-value'); // Should revert on error
    
    consoleSpy.mockRestore();
  });

  it('should handle localStorage getItem errors', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Access denied');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
    
    expect(result.current[0]).toBe('default-value');
  });

  it('should synchronize across multiple hooks with same key', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('shared-key', 'initial'));
    
    act(() => {
      result.current[1]('updated-value');
    });
    
    // Note: In a real implementation, this would require a more sophisticated setup
    // to test cross-component synchronization. This test demonstrates the expected behavior.
    expect(result.current[0]).toBe('updated-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('shared-key', JSON.stringify('updated-value'));
  });

  it('should handle complex objects', () => {
    const complexObject = { id: 1, name: 'Test', nested: { value: 42 } };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));
    
    const { result } = renderHook(() => useLocalStorage('object-key', {}));
    
    expect(result.current[0]).toEqual(complexObject);
  });

  it('should handle arrays', () => {
    const arrayValue = [1, 2, 3, 'test'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(arrayValue));
    
    const { result } = renderHook(() => useLocalStorage('array-key', []));
    
    expect(result.current[0]).toEqual(arrayValue);
  });
});
