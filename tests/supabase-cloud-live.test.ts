import { describe, it, expect } from 'vitest';
import { Client } from 'pg';

const connectionString = process.env.SUPABASE_DB_URL;
const isLiveDb = !!connectionString;

describe.skipIf(!isLiveDb)('Phase 7 & 8: Supabase Cloud Live Multi-Tenant & RLS Isolation Verification', () => {
  let client: Client;

  it('should successfully connect to Supabase Cloud PostgreSQL', async () => {
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    const res = await client.query('SELECT 1 as connected;');
    expect(res.rows[0].connected).toBe(1);
  });

  it('should verify all 22 public tables exist on Supabase Cloud', async () => {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = res.rows.map(r => r.table_name);
    const requiredTables = [
      'organizations',
      'departments',
      'memberships',
      'teaching_assignments',
      'profiles',
      'question_bank',
      'assessment_matrices',
      'matrix_rows',
      'test_specifications',
      'tests',
      'curriculum_grades',
      'curriculum_chapters',
      'curriculum_lessons',
      'learning_requirements',
      'assessment_templates',
      'phenomena',
      'international_contexts',
      'context_stimuli',
      'context_traces',
      'quality_checks',
      'audit_logs',
      'knowledge_documents'
    ];

    requiredTables.forEach(t => {
      expect(tableNames).toContain(t);
    });
  });

  it('should verify Organization A and seed Organization B for cross-tenant isolation test', async () => {
    // Verify Org A
    const orgA = await client.query(`SELECT id, name, code FROM organizations WHERE code = 'THCS_THPT_PHAN_VAN_TRI';`);
    expect(orgA.rows.length).toBe(1);
    expect(orgA.rows[0].name).toBe('Trường THCS-THPT Phan Văn Trị');

    // Seed Org B if not present
    await client.query(`
      INSERT INTO organizations (id, name, code, province, district)
      VALUES (
        'a0000000-0000-0000-0000-000000000002',
        'Trường THCS Nguyễn Du',
        'THCS_NGUYEN_DU',
        'Thành phố Cần Thơ',
        'Quận Ninh Kiều'
      ) ON CONFLICT (code) DO NOTHING;
    `);

    // Seed Dept B
    await client.query(`
      INSERT INTO departments (id, organization_id, name, code, subject_area)
      VALUES (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002',
        'Tổ Khoa học tự nhiên Nguyễn Du',
        'TO_KHTN_ND',
        'KHTN'
      ) ON CONFLICT (organization_id, code) DO NOTHING;
    `);

    const orgB = await client.query(`SELECT id, name, code FROM organizations WHERE code = 'THCS_NGUYEN_DU';`);
    expect(orgB.rows.length).toBe(1);
    expect(orgB.rows[0].name).toBe('Trường THCS Nguyễn Du');
  });

  it('should verify RLS policies are enabled on all sensitive multi-tenant tables', async () => {
    const res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('organizations', 'departments', 'memberships', 'teaching_assignments', 'question_bank', 'assessment_matrices', 'tests');
    `);

    res.rows.forEach(r => {
      expect(r.rowsecurity).toBe(true);
    });
  });

  it('should verify Row Level Security isolation helper functions exist', async () => {
    const res = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
        AND routine_name IN ('auth_user_has_org_role', 'auth_user_org_ids');
    `);

    const fnNames = res.rows.map(r => r.routine_name);
    expect(fnNames).toContain('auth_user_has_org_role');
    expect(fnNames).toContain('auth_user_org_ids');
  });

  it('should close client connection cleanly', async () => {
    await client.end();
  });
});
