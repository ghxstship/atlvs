import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';
import isInSubnet from 'is-in-subnet';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window as any);

export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripHtml?: boolean;
}

export class InputSanitizer {
  /**
   * Sanitize string input with configurable options
   */
  static sanitizeString(input: string, options: SanitizationOptions = {}): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input.trim();

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // HTML sanitization
    if (options.stripHtml || !options.allowHtml) {
      sanitized = validator.escape(sanitized);
    } else if (options.allowHtml) {
      // Configure DOMPurify
      const purifyConfig = {
        ALLOWED_TAGS: options.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'a'],
        ALLOWED_ATTR: options.allowedAttributes || {
          'a': ['href', 'target', 'rel'],
        },
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
      };

      sanitized = DOMPurifyInstance.sanitize(sanitized, purifyConfig);
    }

    return sanitized;
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    const sanitized = email.trim().toLowerCase();

    if (!validator.isEmail(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized;
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const sanitized = url.trim();

    if (!validator.isURL(sanitized, {
      protocols: ['http', 'https'],
      require_protocol: true,
      disallow_auth: true,
    })) {
      throw new Error('Invalid URL format');
    }

    return sanitized;
  }

  /**
   * Sanitize SQL identifier (table/column names)
   */
  static sanitizeSqlIdentifier(identifier: string): string {
    if (!identifier || typeof identifier !== 'string') {
      return '';
    }

    // Only allow alphanumeric, underscore, and basic patterns
    const sanitized = identifier.replace(/[^a-zA-Z0-9_]/g, '');

    if (!sanitized || sanitized.length === 0) {
      throw new Error('Invalid identifier');
    }

    return sanitized;
  }

  /**
   * Sanitize file path
   */
  static sanitizeFilePath(path: string): string {
    if (!path || typeof path !== 'string') {
      return '';
    }

    // Remove dangerous path traversal sequences
    let sanitized = path
      .replace(/\.\./g, '') // Remove ..
      .replace(/~/g, '') // Remove ~
      .replace(/\\/g, '/') // Normalize separators
      .replace(/\/+/g, '/') // Remove multiple slashes
      .trim();

    // Ensure path doesn't start with dangerous patterns
    if (sanitized.startsWith('/') ||
        sanitized.includes('../') ||
        sanitized.includes('..\\')) {
      throw new Error('Invalid file path');
    }

    return sanitized;
  }

  /**
   * Validate and sanitize IP address
   */
  static sanitizeIPAddress(ip: string): string {
    if (!ip || typeof ip !== 'string') {
      return '';
    }

    const sanitized = ip.trim();

    if (!validator.isIP(sanitized)) {
      throw new Error('Invalid IP address');
    }

    // Check for private/internal IPs that shouldn't be logged
    const privateSubnets = [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
      '127.0.0.0/8',
      '169.254.0.0/16',
      '::1/128',
      'fc00::/7',
      'fe80::/10',
    ];

    if (privateSubnets.some(subnet => isInSubnet(sanitized, subnet))) {
      return '[REDACTED]'; // Don't log private IPs
    }

    return sanitized;
  }

  /**
   * Sanitize user agent string
   */
  static sanitizeUserAgent(userAgent: string): string {
    if (!userAgent || typeof userAgent !== 'string') {
      return '';
    }

    // Limit length and remove potentially malicious content
    const sanitized = userAgent.substring(0, 500)
      .replace(/[<>'"&]/g, '') // Remove HTML characters
      .trim();

    return sanitized;
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any, options: { min?: number; max?: number; integer?: boolean } = {}): number {
    let num: number;

    if (typeof input === 'string') {
      num = parseFloat(input);
    } else if (typeof input === 'number') {
      num = input;
    } else {
      throw new Error('Invalid number input');
    }

    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }

    if (options.integer && !Number.isInteger(num)) {
      throw new Error('Integer required');
    }

    if (options.min !== undefined && num < options.min) {
      throw new Error(`Value must be >= ${options.min}`);
    }

    if (options.max !== undefined && num > options.max) {
      throw new Error(`Value must be <= ${options.max}`);
    }

    return num;
  }

  /**
   * Deep sanitize object properties
   */
  static sanitizeObject(obj: any, schema: Record<string, SanitizationOptions>): any {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const sanitized: any = {};

    for (const [key, options] of Object.entries(schema)) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value, options);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item =>
            typeof item === 'string' ? this.sanitizeString(item, options) : item
          );
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Check for SQL injection patterns
   */
  static detectSqlInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const patterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x23)|(;)|(\\x3B)|(\\\\x)|(\\x))/i,
      /(<script|javascript:|vbscript:|onload=|onerror=)/i,
    ];

    return patterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  static detectXSS(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const patterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload[\s]*=/i,
      /onerror[\s]*=/i,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/i,
      /<object[\s\S]*?>[\s\S]*?<\/object>/i,
      /<embed[\s\S]*?>[\s\S]*?<\/embed>/i,
    ];

    return patterns.some(pattern => pattern.test(input));
  }
}

export default InputSanitizer;
