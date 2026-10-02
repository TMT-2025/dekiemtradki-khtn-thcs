import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  evaluateDatabaseSafety,
  ProductionDatabaseConfigurationError
} from '../lib/supabase/database-safety';
import { getSupabaseServerClient } from '../lib/supabase/server';

describe('Supabase Multi-Tenant Architecture & RLS Security Tests', () => {
  const schema004Path = path.join(process.cwd(), 'database', '004_multi_tenant_organizations.sql');

  it('should verify 004_multi_tenant_organizations.sql exists and is non-empty', () => {
    expect(fs.existsSync(schema004Path)).toBe(true);
    const sql004 = fs.readFileSync(schema004Path, 'utf8');
    expect(sql004.length).toBeGreaterThan(1500);
  });

  it('should verify all multi-tenant entities are defined in schema', () => {
    const sql004 = fs.readFileSync(schema004Path, 'utf8');

    const expectedTables = [
      'organizations',
      'departments',
      'memberships',
      'teaching_assignments'
    ];

    expectedTables.forEach(table => {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i');
      expect(sql004).toMatch(regex);
    });
  });

  it('should verify 5 RBAC roles are supported with strict CHECK constraint', () => {
    const sql004 = fs.readFileSync(schema004Path, 'utf8');
    const roles = ['super_admin', 'school_admin', 'dept_head', 'vice_head', 'teacher'];

    roles.forEach(role => {
      expect(sql004).toContain(`'${role}'`);
    });
    expect(sql004).toMatch(/CHECK\s*\(\s*role\s+IN\s*\(\s*'super_admin'/);
  });

  it('should verify tenant scoping columns are added to question_bank, matrices, and tests', () => {
    const sql004 = fs.readFileSync(schema004Path, 'utf8');

    expect(sql004).toContain('ALTER TABLE question_bank ADD COLUMN organization_id');
    expect(sql004).toContain('ALTER TABLE question_bank ADD COLUMN department_id');
    expect(sql004).toContain('ALTER TABLE question_bank ADD COLUMN visibility');
    expect(sql004).toContain('ALTER TABLE assessment_matrices ADD COLUMN organization_id');
    expect(sql004).toContain('ALTER TABLE tests ADD COLUMN organization_id');
  });

  it('should verify PostgreSQL Row Level Security (RLS) policies and helper functions', () => {
    const sql004 = fs.readFileSync(schema004Path, 'utf8');

    // RLS enabled
    expect(sql004).toContain('ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;');
    expect(sql004).toContain('ALTER TABLE departments ENABLE ROW LEVEL SECURITY;');
    expect(sql004).toContain('ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;');
    expect(sql004).toContain('ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;');

    // Helper functions
    expect(sql004).toContain('auth_user_has_org_role');
    expect(sql004).toContain('auth_user_org_ids');

    // Tenant isolation policies
    expect(sql004).toContain('Multi-tenant question read policy');
    expect(sql004).toContain('Multi-tenant matrix access');
    expect(sql004).toContain('Multi-tenant tests access');
  });

  it('should verify default baseline organization and department are seeded', () => {
    const sql004 = fs.readFileSync(schema004Path, 'utf8');

    expect(sql004).toContain('THCS_THPT_PHAN_VAN_TRI');
    expect(sql004).toContain('Trường THCS-THPT Phan Văn Trị');
    expect(sql004).toContain('TO_KHTN_PVT');
  });

  it('should verify server-side Supabase client initialization', () => {
    const serverClient = getSupabaseServerClient();
    expect(serverClient).toBeDefined();
    expect(typeof serverClient.from).toBe('function');
  });

  it('should verify fail-fast error thrown if SUPABASE_REQUIRED=true and credentials missing', () => {
    const invalidEnv = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ''
    };

    expect(() => evaluateDatabaseSafety(invalidEnv)).toThrow(ProductionDatabaseConfigurationError);
  });

  it('should verify evaluation passes when valid Supabase credentials provided', () => {
    const validEnv = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://dekiemtradki-prod.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-service-key'
    };

    const status = evaluateDatabaseSafety(validEnv);
    expect(status.isConfigured).toBe(true);
    expect(status.storageMode).toBe('PRODUCTION_SUPABASE');
    expect(status.hasAnonKey).toBe(true);
    expect(status.hasServiceRoleKey).toBe(true);
  });
});
