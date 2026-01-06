/**
 * kai-hook-system - Security Validation Layer
 *
 * Centralized security enforcement for all hooks.
 * Prevents injection attacks, validates paths, enforces rate limits.
 */

import { existsSync } from 'fs';
import { resolve, join, relative } from 'path';
import { getPAIDir, appendJSONL, logHook } from './shared';
import type { KaiEvent } from './event-bus';

/**
 * Security event log entry
 */
interface SecurityEvent {
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  details: string;
  hook_name?: string;
  session_id?: string;
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  first_seen: number;
  last_seen: number;
}

/**
 * Security Validator
 */
export class SecurityValidator {
  private static rateLimits = new Map<string, RateLimitEntry>();
  private static readonly RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
  private static readonly RATE_LIMIT_MAX_CALLS = 100; // Max calls per window

  /**
   * Validate hook input data
   * Prevents injection attacks and malformed data
   */
  static validateInput(data: any): boolean {
    if (!data || typeof data !== 'object') {
      this.logSecurityEvent({
        severity: 'medium',
        type: 'invalid_input',
        details: 'Input data is not an object'
      });
      return false;
    }

    // Check for extremely large payloads (potential DoS)
    const jsonSize = JSON.stringify(data).length;
    if (jsonSize > 10 * 1024 * 1024) {
      // 10MB limit
      this.logSecurityEvent({
        severity: 'high',
        type: 'payload_too_large',
        details: `Payload size: ${jsonSize} bytes (>10MB)`
      });
      return false;
    }

    return true;
  }

  /**
   * Check for malicious patterns in text content
   */
  static checkMaliciousPatterns(content: string): string[] {
    const patterns: Array<{ name: string; regex: RegExp }> = [
      // Command injection
      {
        name: 'command_injection',
        regex: /(\$\(.*\)|`.*`|;\s*rm\s+-rf|>\s*\/dev\/|eval\s*\()/gi
      },

      // Path traversal
      {
        name: 'path_traversal',
        regex: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/gi
      },

      // SQL injection
      {
        name: 'sql_injection',
        regex: /('\s*OR\s*'1'\s*=\s*'1|UNION\s+SELECT|DROP\s+TABLE)/gi
      },

      // Script injection
      {
        name: 'script_injection',
        regex: /(<script|javascript:|onerror=|onload=)/gi
      },

      // Sensitive file access
      {
        name: 'sensitive_file',
        regex: /(\/etc\/passwd|\/etc\/shadow|\.ssh\/id_rsa|\.aws\/credentials)/gi
      }
    ];

    const detected: string[] = [];

    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        detected.push(pattern.name);
        this.logSecurityEvent({
          severity: 'high',
          type: pattern.name,
          details: `Malicious pattern detected: ${pattern.name}`
        });
      }
    }

    return detected;
  }

  /**
   * Validate file path (prevent directory traversal)
   */
  static validatePath(path: string, allowedBaseDir?: string): boolean {
    try {
      // Resolve to absolute path
      const absolutePath = resolve(path);

      // Check if path exists
      if (!existsSync(absolutePath)) {
        // Path doesn't exist, but that's okay for new files
        // Just check the base directory is valid
      }

      // If base directory is specified, ensure path is within it
      if (allowedBaseDir) {
        const resolvedBaseDir = resolve(allowedBaseDir);
        const relativePath = relative(resolvedBaseDir, absolutePath);

        // Check if path escapes base directory
        if (relativePath.startsWith('..') || resolve(absolutePath) !== absolutePath) {
          this.logSecurityEvent({
            severity: 'high',
            type: 'path_traversal',
            details: `Path escapes base directory: ${path}`
          });
          return false;
        }
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        '/etc/passwd',
        '/etc/shadow',
        '.ssh/id_rsa',
        '.aws/credentials',
        'web.config',
        '.env'
      ];

      const lowerPath = path.toLowerCase();
      for (const pattern of suspiciousPatterns) {
        if (lowerPath.includes(pattern.toLowerCase())) {
          this.logSecurityEvent({
            severity: 'critical',
            type: 'sensitive_file_access',
            details: `Attempt to access sensitive file: ${path}`
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logSecurityEvent({
        severity: 'medium',
        type: 'path_validation_error',
        details: `Path validation failed: ${error}`
      });
      return false;
    }
  }

  /**
   * Check rate limit for a hook
   */
  static checkRateLimit(hookName: string): boolean {
    const now = Date.now();
    const key = `hook:${hookName}`;

    // Get existing rate limit entry
    let entry = this.rateLimits.get(key);

    if (!entry) {
      // First call - create entry
      entry = { count: 1, first_seen: now, last_seen: now };
      this.rateLimits.set(key, entry);
      return true;
    }

    // Check if window has expired
    if (now - entry.first_seen > this.RATE_LIMIT_WINDOW_MS) {
      // Reset window
      entry.count = 1;
      entry.first_seen = now;
      entry.last_seen = now;
      return true;
    }

    // Increment counter
    entry.count++;
    entry.last_seen = now;

    // Check if limit exceeded
    if (entry.count > this.RATE_LIMIT_MAX_CALLS) {
      this.logSecurityEvent({
        severity: 'high',
        type: 'rate_limit_exceeded',
        details: `Hook ${hookName} exceeded rate limit: ${entry.count} calls in ${
          now - entry.first_seen
        }ms`
      });
      return false;
    }

    return true;
  }

  /**
   * Validate event structure
   */
  static validateEvent(event: KaiEvent): boolean {
    // Check required fields
    if (!event.type || !event.timestamp || !event.session_id) {
      this.logSecurityEvent({
        severity: 'medium',
        type: 'invalid_event',
        details: 'Event missing required fields'
      });
      return false;
    }

    // Validate session_id format (prevent injection)
    if (!/^[a-zA-Z0-9_-]+$/.test(event.session_id)) {
      this.logSecurityEvent({
        severity: 'high',
        type: 'invalid_session_id',
        details: `Invalid session_id format: ${event.session_id}`
      });
      return false;
    }

    // Check for malicious patterns in payload
    const payloadStr = JSON.stringify(event.payload);
    const maliciousPatterns = this.checkMaliciousPatterns(payloadStr);

    if (maliciousPatterns.length > 0) {
      this.logSecurityEvent({
        severity: 'critical',
        type: 'malicious_payload',
        details: `Malicious patterns detected in event payload: ${maliciousPatterns.join(
          ', '
        )}`,
        session_id: event.session_id
      });
      return false;
    }

    return true;
  }

  /**
   * Sanitize text content (remove potentially dangerous characters)
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate transcript path
   */
  static validateTranscriptPath(path: string): boolean {
    // Must be within PAI directory
    const paiDir = getPAIDir();
    return this.validatePath(path, paiDir);
  }

  /**
   * Log security event
   */
  private static logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      timestamp: new Date().toISOString(),
      ...event
    };

    // Log to stderr
    logHook(
      'security',
      `${event.severity.toUpperCase()}: ${event.type} - ${event.details}`,
      'warn'
    );

    // Append to security audit log
    try {
      const paiDir = getPAIDir();
      const auditLog = join(paiDir, 'logs', 'security-audit.jsonl');
      appendJSONL(auditLog, fullEvent);
    } catch (error) {
      // Failed to write audit log, but don't crash
      console.error('[kai-security] Failed to write audit log:', error);
    }
  }

  /**
   * Audit log for successful operations
   */
  static auditLog(
    type: string,
    details: string,
    hookName?: string,
    sessionId?: string
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      severity: 'low',
      type,
      details,
      hook_name: hookName,
      session_id: sessionId
    };

    try {
      const paiDir = getPAIDir();
      const auditLog = join(paiDir, 'logs', 'security-audit.jsonl');
      appendJSONL(auditLog, event);
    } catch (error) {
      // Silent failure for audit logs
    }
  }

  /**
   * Clean up old rate limit entries
   */
  static cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimits.entries()) {
      if (now - entry.last_seen > this.RATE_LIMIT_WINDOW_MS * 2) {
        this.rateLimits.delete(key);
      }
    }
  }
}

/**
 * Security middleware for hooks
 * Validates events and enforces security policies
 */
export async function securityMiddleware(
  event: KaiEvent,
  hookName: string
): Promise<boolean> {
  // Check rate limit
  if (!SecurityValidator.checkRateLimit(hookName)) {
    return false;
  }

  // Validate event structure
  if (!SecurityValidator.validateEvent(event)) {
    return false;
  }

  // Validate transcript path if present
  if (event.transcript_path) {
    if (!SecurityValidator.validateTranscriptPath(event.transcript_path)) {
      return false;
    }
  }

  // Audit successful validation
  SecurityValidator.auditLog(
    'hook_execution',
    `Hook ${hookName} passed security validation`,
    hookName,
    event.session_id
  );

  return true;
}
