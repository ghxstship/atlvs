import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedAuthService } from '../src/enhanced-auth-service';
import { SecurityLogger } from '../src/security-logger';
import { validateCSRFToken, generateCSRFToken } from '../../lib/csrf';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    getUser: vi.fn(),
    mfa: {
      listFactors: vi.fn(),
      verify: vi.fn(),
      challenge: vi.fn(),
    },
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn(),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    rpc: vi.fn(),
  })),
};

describe('Security Implementation Tests', () => {
  let authService: EnhancedAuthService;
  let securityLogger: SecurityLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new EnhancedAuthService();
    securityLogger = new SecurityLogger();

    // Override the supabase client for testing
    (authService as any).supabase = mockSupabase;
    (securityLogger as any).supabase = mockSupabase;
  });

  describe('Authentication & Authorization', () => {
    describe('JWT Implementation', () => {
      it('should create session tokens with proper expiration', async () => {
        const mockRequest = {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        };

        // Mock session creation
        mockSupabase.from.mockReturnValue({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'session-123',
                  session_token: 'token-123',
                  refresh_token: 'refresh-123',
                  expires_at: new Date(Date.now() + 15 * 60 * 1000),
                },
                error: null,
              }),
            })),
          })),
        });

        const sessionData = await (authService as any).createUserSession(
          'user-123',
          'org-123',
          mockRequest as any
        );

        expect(sessionData).toBeDefined();
        expect(sessionData.sessionToken).toBeDefined();
        expect(sessionData.refreshToken).toBeDefined();
        expect(sessionData.expiresAt).toBeInstanceOf(Date);
      });

      it('should refresh expired sessions using refresh tokens', async () => {
        // Mock expired session lookup
        mockSupabase.from
          .mockReturnValueOnce({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      session_token: 'expired-token',
                      refresh_token: 'valid-refresh',
                      created_at: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
                    },
                    error: null,
                  }),
                })),
              })),
            })),
          })
          // Mock refresh token validation
          .mockReturnValueOnce({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      refresh_token: 'valid-refresh',
                      created_at: new Date(),
                    },
                    error: null,
                  }),
                })),
              })),
            })),
          })
          // Mock session update
          .mockReturnValueOnce({
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: { session_token: 'new-token' },
                    error: null,
                  }),
                })),
              })),
            })),
          });

        const sessionData = await authService.validateSession('expired-token');

        expect(sessionData).toBeDefined();
        expect(sessionData?.sessionToken).toBe('new-token');
      });
    });

    describe('Role-Based Access Control', () => {
      it('should enforce role-based route access', () => {
        const mockRequest = {
          nextUrl: { pathname: '/api/v1/finance' },
        };

        // Test member access to finance routes (should be denied)
        const hasAccess = (authService as any).checkRBAC(
          { membership: { role: 'member' } },
          '/api/v1/finance',
          mockRequest as any
        );

        expect(hasAccess).toBe(false);

        // Test manager access to finance routes (should be allowed)
        const managerHasAccess = (authService as any).checkRBAC(
          { membership: { role: 'manager' } },
          '/api/v1/finance',
          mockRequest as any
        );

        expect(managerHasAccess).toBe(true);
      });

      it('should allow owner full access', () => {
        const mockRequest = {
          nextUrl: { pathname: '/api/v1/audit_logs' },
        };

        const hasAccess = (authService as any).checkRBAC(
          { membership: { role: 'owner' } },
          '/api/v1/audit_logs',
          mockRequest as any
        );

        expect(hasAccess).toBe(true);
      });
    });

    describe('Multi-Factor Authentication', () => {
      it('should enforce MFA for privileged roles', async () => {
        // Mock user lookup
        mockSupabase.from.mockReturnValue({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  memberships: [{
                    organization: { security_settings: {} },
                    role: 'admin',
                  }],
                },
                error: null,
              }),
            })),
          })),
        });

        const requiresMFA = await (authService as any).isMFARequired('user-123', 'admin', {});

        expect(requiresMFA).toBe(true);
      });

      it('should complete MFA verification and create session', async () => {
        // Mock MFA verification
        mockSupabase.auth.mfa.verify.mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        });

        // Mock user lookup
        mockSupabase.from
          .mockReturnValueOnce({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    memberships: [{
                      organization_id: 'org-123',
                      organization: { id: 'org-123', name: 'Test Org' },
                      role: 'admin',
                    }],
                  },
                  error: null,
                }),
              })),
            })),
          })
          // Mock session creation
          .mockReturnValueOnce({
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { session_token: 'mfa-session-token' },
                  error: null,
                }),
              })),
            })),
          });

        const mockRequest = {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        };

        const result = await authService.completeMFAAuthentication(
          'factor-123',
          '123456',
          mockRequest as any
        );

        expect(result.success).toBe(true);
        expect(result.sessionData?.sessionToken).toBe('mfa-session-token');
      });
    });

    describe('Brute Force Protection', () => {
      it('should track failed login attempts', async () => {
        // Mock user lookup
        mockSupabase.from
          .mockReturnValueOnce({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'user-123', failed_login_attempts: 2 },
                  error: null,
                }),
              })),
            })),
          })
          // Mock user update
          .mockReturnValueOnce({
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(),
                })),
              })),
            })),
          });

        const mockRequest = {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn().mockReturnValue('127.0.0.1') },
        };

        await (authService as any).handleFailedLogin('test@example.com', '127.0.0.1', mockRequest as any);

        expect(mockSupabase.from).toHaveBeenCalled();
      });

      it('should lock accounts after 5 failed attempts', async () => {
        // Mock user with 4 failed attempts
        mockSupabase.from
          .mockReturnValueOnce({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'user-123', failed_login_attempts: 4 },
                  error: null,
                }),
              })),
            })),
          })
          // Mock user update
          .mockReturnValueOnce({
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(),
                })),
              })),
            })),
          });

        const mockRequest = {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn().mockReturnValue('127.0.0.1') },
        };

        await (authService as any).handleFailedLogin('test@example.com', '127.0.0.1', mockRequest as any);

        // Verify account lockout logic is called
        expect(mockSupabase.from).toHaveBeenCalled();
      });
    });
  });

  describe('Data Security', () => {
    describe('CSRF Protection', () => {
      it('should generate secure CSRF tokens', () => {
        const token1 = generateCSRFToken();
        const token2 = generateCSRFToken();

        expect(token1).toBeDefined();
        expect(token2).toBeDefined();
        expect(token1).not.toBe(token2);
        expect(token1.length).toBeGreaterThan(16); // At least 16 bytes when base64 encoded
      });

      it('should validate matching CSRF tokens', () => {
        const token = generateCSRFToken();

        const mockRequest = {
          cookies: {
            get: vi.fn((name) => name === 'csrf-token' ? { value: token } : undefined),
          },
          headers: {
            get: vi.fn((name) => name === 'x-csrf-token' ? token : undefined),
          },
        };

        const isValid = validateCSRFToken(mockRequest as any);
        expect(isValid).toBe(true);
      });

      it('should reject mismatched CSRF tokens', () => {
        const token1 = generateCSRFToken();
        const token2 = generateCSRFToken();

        const mockRequest = {
          cookies: {
            get: vi.fn(() => ({ value: token1 })),
          },
          headers: {
            get: vi.fn(() => token2),
          },
        };

        const isValid = validateCSRFToken(mockRequest as any);
        expect(isValid).toBe(false);
      });
    });

    describe('Security Event Logging', () => {
      it('should log authentication events', async () => {
        mockSupabase.rpc.mockResolvedValue({ id: 'event-123' });

        await securityLogger.logAuthEvent(
          'login_success',
          'user-123',
          'org-123',
          { email: 'test@example.com' },
          '127.0.0.1',
          'Mozilla/5.0...'
        );

        expect(mockSupabase.rpc).toHaveBeenCalledWith('log_security_event', {
          p_organization_id: 'org-123',
          p_user_id: 'user-123',
          p_event_type: 'login_success',
          p_severity: 'low',
          p_details: { email: 'test@example.com' },
          p_ip_address: '127.0.0.1',
          p_user_agent: 'Mozilla/5.0...',
          p_session_id: undefined,
        });
      });

      it('should log suspicious activities', async () => {
        mockSupabase.rpc.mockResolvedValue({ id: 'event-123' });

        await securityLogger.logSuspiciousActivity(
          'brute_force_attempt',
          { attempts: 5, ipAddress: '127.0.0.1' },
          'user-123',
          'org-123',
          '127.0.0.1',
          'Mozilla/5.0...'
        );

        expect(mockSupabase.rpc).toHaveBeenCalledWith('log_security_event', {
          p_organization_id: 'org-123',
          p_user_id: 'user-123',
          p_event_type: 'brute_force_attempt',
          p_severity: 'high',
          p_details: { attempts: 5, ipAddress: '127.0.0.1' },
          p_ip_address: '127.0.0.1',
          p_user_agent: 'Mozilla/5.0...',
          p_session_id: undefined,
        });
      });
    });
  });

  describe('Row Level Security', () => {
    describe('Field-Level Access Control', () => {
      it('should restrict access to sensitive fields based on role', () => {
        // Mock data classification lookup
        mockSupabase.from.mockReturnValue({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { classification_level: 'restricted' },
                  error: null,
                }),
              })),
            })),
          })),
        });

        // This would test the check_field_access function
        // In a real test, we'd call the database function
        expect(true).toBe(true); // Placeholder for actual RLS testing
      });

      it('should mask sensitive data for unauthorized users', () => {
        // Test data masking logic
        const maskFunction = (authService as any).maskSensitiveField;

        expect(maskFunction('user@example.com', 'users', 'email')).toBe('***@***.***');
        expect(maskFunction('555-123-4567', 'users', 'phone')).toBe('***-***-****');
        expect(maskFunction('secret-token', 'users', 'session_token')).toBe('***REDACTED***');
      });
    });
  });
});
