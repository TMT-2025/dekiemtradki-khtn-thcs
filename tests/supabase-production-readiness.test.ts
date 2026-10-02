import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  evaluateDatabaseSafety,
  ProductionDatabaseConfigurationError
} from '../lib/supabase/database-safety';

describe('Phase 8.2 & 8.3: Supabase Production Readiness & Safety Gate', () => {
  const schema001Path = path.join(process.cwd(), 'database', '001_initial_schema.sql');
  const seed002Path = path.join(process.cwd(), 'database', '002_seed_curriculum.sql');
  const schema003Path = path.join(process.cwd(), 'database', '003_context_engine_schema.sql');

  it('should verify migration files exist and contain non-empty SQL content', () => {
    expect(fs.existsSync(schema001Path)).toBe(true);
    expect(fs.existsSync(seed002Path)).toBe(true);
    expect(fs.existsSync(schema003Path)).toBe(true);

    const sql001 = fs.readFileSync(schema001Path, 'utf8');
    const sql002 = fs.readFileSync(seed002Path, 'utf8');
    const sql003 = fs.readFileSync(schema003Path, 'utf8');

    expect(sql001.length).toBeGreaterThan(1000);
    expect(sql002.length).toBeGreaterThan(1000);
    expect(sql003.length).toBeGreaterThan(1000);
  });

  it('should verify all core KHTN tables are defined in SQL schema with primary keys and constraints', () => {
    const sql001 = fs.readFileSync(schema001Path, 'utf8');

    const expectedTables = [
      'profiles',
      'knowledge_documents',
      'curriculum_grades',
      'curriculum_chapters',
      'curriculum_lessons',
      'learning_requirements',
      'assessment_templates',
      'assessment_matrices',
      'matrix_rows',
      'test_specifications',
      'question_bank',
      'tests',
      'quality_checks',
      'audit_logs'
    ];

    expectedTables.forEach(table => {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i');
      expect(sql001).toMatch(regex);
    });

    // Check primary keys and foreign keys
    expect(sql001).toContain('REFERENCES auth.users(id)');
    expect(sql001).toContain('REFERENCES curriculum_grades(code)');
    expect(sql001).toContain('REFERENCES curriculum_chapters(id)');
    expect(sql001).toContain('REFERENCES assessment_matrices(id)');
  });

  it('should verify Context-Based Science Assessment Engine tables in 003_context_engine_schema.sql', () => {
    const sql003 = fs.readFileSync(schema003Path, 'utf8');

    const expectedContextTables = [
      'phenomena',
      'international_contexts',
      'context_stimuli',
      'context_traces'
    ];

    expectedContextTables.forEach(table => {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i');
      expect(sql003).toMatch(regex);
    });

    // Verify key columns
    expect(sql003).toContain('phenomenon_id VARCHAR(50) UNIQUE NOT NULL');
    expect(sql003).toContain('external_id VARCHAR(50) UNIQUE NOT NULL');
    expect(sql003).toContain('stimulus_id VARCHAR(50) UNIQUE NOT NULL');
    expect(sql003).toContain('is_synthetic BOOLEAN DEFAULT false');
    expect(sql003).toContain('reading_load VARCHAR(10)');
    expect(sql003).toContain('learning_requirement_id TEXT NOT NULL');
    expect(sql003).toContain('matrix_cell_id VARCHAR(100) NOT NULL');
  });

  it('should verify Indexes, RLS and Triggers are properly declared', () => {
    const sql001 = fs.readFileSync(schema001Path, 'utf8');
    const sql003 = fs.readFileSync(schema003Path, 'utf8');

    // RLS in 001 and 003
    expect(sql001).toContain('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
    expect(sql001).toContain('ALTER TABLE assessment_matrices ENABLE ROW LEVEL SECURITY;');
    expect(sql003).toContain('ALTER TABLE phenomena ENABLE ROW LEVEL SECURITY;');
    expect(sql003).toContain('ALTER TABLE international_contexts ENABLE ROW LEVEL SECURITY;');
    expect(sql003).toContain('ALTER TABLE context_stimuli ENABLE ROW LEVEL SECURITY;');
    expect(sql003).toContain('ALTER TABLE context_traces ENABLE ROW LEVEL SECURITY;');

    // Indexes in 003
    expect(sql003).toContain('CREATE INDEX IF NOT EXISTS idx_phenomena_grade_subject');
    expect(sql003).toContain('CREATE INDEX IF NOT EXISTS idx_stimuli_context_id');
    expect(sql003).toContain('CREATE INDEX IF NOT EXISTS idx_traces_question');

    // Triggers in 003
    expect(sql003).toContain('CREATE OR REPLACE FUNCTION update_updated_at_column()');
    expect(sql003).toContain('CREATE TRIGGER trg_phenomena_updated_at');
    expect(sql003).toContain('CREATE TRIGGER trg_context_stimuli_updated_at');
  });

  it('should verify seed data completeness for grades 6-9 in 002_seed_curriculum.sql', () => {
    const sql002 = fs.readFileSync(seed002Path, 'utf8');

    // Grades 6, 7, 8, 9
    expect(sql002).toContain('(6, \'Khoa học tự nhiên 6\'');
    expect(sql002).toContain('(7, \'Khoa học tự nhiên 7\'');
    expect(sql002).toContain('(8, \'Khoa học tự nhiên 8\'');
    expect(sql002).toContain('(9, \'Khoa học tự nhiên 9\'');

    // Templates
    expect(sql002).toContain('TEMPLATE_B_LOCAL');
    expect(sql002).toContain('TEMPLATE_A');
  });

  it('should FAIL FAST when SUPABASE_REQUIRED=true and Supabase credentials are missing or mock', () => {
    const mockEnv: Record<string, string | undefined> = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-key'
    };

    expect(() => evaluateDatabaseSafety(mockEnv)).toThrowError(ProductionDatabaseConfigurationError);
    expect(() => evaluateDatabaseSafety(mockEnv)).toThrowError(/PRODUCTION_DATABASE_CONFIG_ERROR/);
  });

  it('should FAIL FAST when SUPABASE_REQUIRED=true and URL is completely unset', () => {
    const mockEnv: Record<string, string | undefined> = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ''
    };

    expect(() => evaluateDatabaseSafety(mockEnv)).toThrowError(ProductionDatabaseConfigurationError);
  });

  it('should ALLOW JSON fallback when SUPABASE_REQUIRED is false or unset in development', () => {
    const devEnv: Record<string, string | undefined> = {
      SUPABASE_REQUIRED: 'false',
      APP_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-key'
    };

    const status = evaluateDatabaseSafety(devEnv);
    expect(status.isRequired).toBe(false);
    expect(status.isConfigured).toBe(false);
    expect(status.storageMode).toBe('JSON_STORAGE');
  });

  it('should PASS verification when valid production Supabase credentials are provided', () => {
    const prodEnv: Record<string, string | undefined> = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://project-ref-xyz123.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-anon-token',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-service-role'
    };

    const status = evaluateDatabaseSafety(prodEnv);
    expect(status.isRequired).toBe(true);
    expect(status.isConfigured).toBe(true);
    expect(status.hasAnonKey).toBe(true);
    expect(status.hasServiceRoleKey).toBe(true);
    expect(status.storageMode).toBe('PRODUCTION_SUPABASE');
  });
});
