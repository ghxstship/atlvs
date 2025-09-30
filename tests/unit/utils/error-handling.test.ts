import { describe, it, expect } from 'vitest';
import { tryCatch, Result } from '../../../packages/application/src/utils/error-handling';

describe('Error Handling Utilities', () => {
  describe('tryCatch', () => {
    it('should return success result for successful operations', () => {
      const result = tryCatch(() => 42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should return error result for failed operations', () => {
      const error = new Error('Test error');
      const result = tryCatch(() => {
        throw error;
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it('should handle async operations', async () => {
      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      };

      const result = await tryCatch(asyncOperation);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('async result');
      }
    });

    it('should handle async errors', async () => {
      const asyncError = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Async error');
      };

      const result = await tryCatch(asyncError);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('Async error');
      }
    });
  });

  describe('Result type', () => {
    it('should create success results', () => {
      const result: Result<string, Error> = { success: true, data: 'success' };

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect('error' in result).toBe(false);
    });

    it('should create error results', () => {
      const error = new Error('test error');
      const result: Result<string, Error> = { success: false, error };

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect('data' in result).toBe(false);
    });
  });
});
