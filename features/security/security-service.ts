/**
 * Security Service & Protection Gate
 * Author: Senior Software Architect
 * Phase 7.4: Security Gate & Production Hardening
 */

export type UserRole = 'ADMIN' | 'HEAD_OF_DEPARTMENT' | 'TEACHER' | 'GUEST';

export interface UserSession {
  userId: string;
  email: string;
  role: UserRole;
  schoolId: string;
}

export type SecurityPermission =
  | 'READ_CONTEXT'
  | 'CREATE_CONTEXT'
  | 'APPROVE_CONTEXT'
  | 'GENERATE_TEST'
  | 'EXPORT_DOCX'
  | 'MANAGE_DOCUMENTS'
  | 'ADMIN_ACCESS';

const ROLE_PERMISSIONS: Record<UserRole, SecurityPermission[]> = {
  ADMIN: [
    'READ_CONTEXT',
    'CREATE_CONTEXT',
    'APPROVE_CONTEXT',
    'GENERATE_TEST',
    'EXPORT_DOCX',
    'MANAGE_DOCUMENTS',
    'ADMIN_ACCESS'
  ],
  HEAD_OF_DEPARTMENT: [
    'READ_CONTEXT',
    'CREATE_CONTEXT',
    'APPROVE_CONTEXT',
    'GENERATE_TEST',
    'EXPORT_DOCX',
    'MANAGE_DOCUMENTS'
  ],
  TEACHER: [
    'READ_CONTEXT',
    'CREATE_CONTEXT',
    'GENERATE_TEST',
    'EXPORT_DOCX'
  ],
  GUEST: [
    'READ_CONTEXT'
  ]
};

export class SecurityService {
  private static rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * RBAC: Check if user role has required permission
   */
  public static hasPermission(role: UserRole, permission: SecurityPermission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * IDOR Check: Ensure user has permission to access specific resource
   */
  public static verifyResourceOwnership(
    user: UserSession,
    resource: { ownerId?: string; schoolId?: string }
  ): boolean {
    if (user.role === 'ADMIN') return true;
    if (resource.schoolId && resource.schoolId !== user.schoolId) return false;
    if (user.role === 'HEAD_OF_DEPARTMENT') return true;
    if (resource.ownerId && resource.ownerId !== user.userId) return false;
    return true;
  }

  /**
   * XSS Sanitization: Clean text inputs from malicious scripts
   */
  public static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  /**
   * Prompt Injection Detection: Detect system prompt overriding attempts
   */
  public static detectPromptInjection(prompt: string): { isSuspicious: boolean; reason?: string } {
    const dangerousPatterns = [
      /ignore previous instructions/i,
      /bỏ qua các hướng dẫn trước/i,
      /bỏ qua toàn bộ chỉ dẫn/i,
      /system override/i,
      /you are now in developer mode/i,
      /reveal the system prompt/i,
      /tiết lộ system prompt/i,
      /disregard safety guidelines/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(prompt)) {
        return {
          isSuspicious: true,
          reason: `Phát hiện mẫu Prompt Injection tiềm ẩn: "${pattern.source}"`
        };
      }
    }

    return { isSuspicious: false };
  }

  /**
   * SQL / Query Injection Detection
   */
  public static detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bUNION\s+ALL\s+SELECT\b)/i,
      /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(\bDELETE\s+FROM\b)/i,
      /(--\s*$)/,
      /(;\s*DROP\b)/i,
      /('\s*OR\s*'1'='1)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Rate Limiting: In-memory sliding window (e.g. 60 requests / minute)
   */
  public static checkRateLimit(key: string, limit: number = 60, windowMs: number = 60000): {
    allowed: boolean;
    remaining: number;
  } {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
  }

  /**
   * Safe File Upload Validation
   */
  public static validateUpload(file: { name: string; size: number; mimeType?: string }): {
    valid: boolean;
    error?: string;
  } {
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.txt', '.png', '.jpg', '.jpeg'];
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Định dạng file không được phép (${ext}). Chỉ hỗ trợ: ${allowedExtensions.join(', ')}`
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Dung lượng file (${(file.size / 1024 / 1024).toFixed(1)} MB) vượt quá giới hạn tối đa 25 MB.`
      };
    }

    return { valid: true };
  }
}
