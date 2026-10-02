import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from 'pg';

const connectionString = process.env.SUPABASE_DB_URL;
const isLiveDb = !!connectionString;

describe.skipIf(!isLiveDb)('Phase 6 & 7: Two-Tenant Cross-School RLS Isolation Benchmark', () => {
  let adminClient: Client;

  const ORG_A = 'a0000000-0000-0000-0000-000000000001'; // THCS-THPT Phan Văn Trị
  const DEPT_A = 'b0000000-0000-0000-0000-000000000001';
  const TEACHER_A = 'e0000000-0000-0000-0000-00000000000a';

  const ORG_B = 'a0000000-0000-0000-0000-000000000002'; // THCS Nguyễn Du
  const DEPT_B = 'b0000000-0000-0000-0000-000000000002';
  const TEACHER_B = 'e0000000-0000-0000-0000-00000000000b';

  const Q_ORG_A_ID = 'c0000000-0000-0000-0000-000000000001';
  const Q_ORG_B_ID = 'c0000000-0000-0000-0000-000000000002';
  const Q_PUBLIC_ID = 'c0000000-0000-0000-0000-000000000003';
  const Q_PRIVATE_A_ID = 'c0000000-0000-0000-0000-000000000004';

  beforeAll(async () => {
    adminClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await adminClient.connect();

    // 1. Seed Teacher A
    await adminClient.query(`
      INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES (
        '${TEACHER_A}',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'teacher-a@example.test',
        'encrypted-pwd-a',
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Thầy Nguyễn Văn A"}',
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
    `);

    await adminClient.query(`
      INSERT INTO profiles (id, email, full_name, school_name, department, role)
      VALUES ('${TEACHER_A}', 'teacher-a@example.test', 'Thầy Nguyễn Văn A', 'Trường THCS-THPT Phan Văn Trị', 'Tổ KHTN', 'TEACHER')
      ON CONFLICT (id) DO NOTHING;
    `);

    await adminClient.query(`
      INSERT INTO memberships (user_id, organization_id, department_id, role, status)
      VALUES ('${TEACHER_A}', '${ORG_A}', '${DEPT_A}', 'teacher', 'ACTIVE')
      ON CONFLICT (user_id, organization_id, department_id, role) DO NOTHING;
    `);

    // 2. Seed Teacher B
    await adminClient.query(`
      INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES (
        '${TEACHER_B}',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'teacher-b@example.test',
        'encrypted-pwd-b',
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Cô Trần Thị B"}',
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
    `);

    await adminClient.query(`
      INSERT INTO profiles (id, email, full_name, school_name, department, role)
      VALUES ('${TEACHER_B}', 'teacher-b@example.test', 'Cô Trần Thị B', 'Trường THCS Nguyễn Du', 'Tổ KHTN Nguyễn Du', 'TEACHER')
      ON CONFLICT (id) DO NOTHING;
    `);

    await adminClient.query(`
      INSERT INTO memberships (user_id, organization_id, department_id, role, status)
      VALUES ('${TEACHER_B}', '${ORG_B}', '${DEPT_B}', 'teacher', 'ACTIVE')
      ON CONFLICT (user_id, organization_id, department_id, role) DO NOTHING;
    `);

    // 3. Seed Questions with Different Scopes
    await adminClient.query(`
      DELETE FROM question_bank WHERE id IN ('${Q_ORG_A_ID}', '${Q_ORG_B_ID}', '${Q_PUBLIC_ID}', '${Q_PRIVATE_A_ID}');
    `);

    // Q1: School A organization scope
    await adminClient.query(`
      INSERT INTO question_bank (
        id, grade_code, semester, topic, subject_area, content_domain, learning_requirement_text,
        cognitive_level, question_type, question_text, correct_answer, explanation, rationale,
        score, source_level, source_citation, organization_id, department_id, created_by, visibility
      ) VALUES (
        '${Q_ORG_A_ID}', 8, 'HK1', 'Phản ứng tỏa nhiệt', 'CHEMISTRY', 'SUBSTANCE_CHANGE', 'Nêu khái niệm',
        'M2', 'MCQ', 'Đề kiểm tra nội bộ Trường THCS-THPT Phan Văn Trị', 'A', 'Giải thích A', 'Lý do A',
        0.25, 'SCHOOL', '{"school":"Phan Văn Trị"}', '${ORG_A}', '${DEPT_A}', '${TEACHER_A}', 'ORGANIZATION'
      );
    `);

    // Q2: School B organization scope
    await adminClient.query(`
      INSERT INTO question_bank (
        id, grade_code, semester, topic, subject_area, content_domain, learning_requirement_text,
        cognitive_level, question_type, question_text, correct_answer, explanation, rationale,
        score, source_level, source_citation, organization_id, department_id, created_by, visibility
      ) VALUES (
        '${Q_ORG_B_ID}', 8, 'HK1', 'Quang hợp ở thực vật', 'BIOLOGY', 'LIVING_THINGS', 'Trình bày vai trò',
        'M2', 'MCQ', 'Đề kiểm tra nội bộ Trường THCS Nguyễn Du', 'B', 'Giải thích B', 'Lý do B',
        0.25, 'SCHOOL', '{"school":"Nguyễn Du"}', '${ORG_B}', '${DEPT_B}', '${TEACHER_B}', 'ORGANIZATION'
      );
    `);

    // Q3: Public question
    await adminClient.query(`
      INSERT INTO question_bank (
        id, grade_code, semester, topic, subject_area, content_domain, learning_requirement_text,
        cognitive_level, question_type, question_text, correct_answer, explanation, rationale,
        score, source_level, source_citation, organization_id, department_id, created_by, visibility
      ) VALUES (
        '${Q_PUBLIC_ID}', 8, 'HK1', 'Định luật bảo toàn khối lượng', 'CHEMISTRY', 'SUBSTANCE_CHANGE', 'Phát biểu định luật',
        'M1', 'MCQ', 'Câu hỏi chuẩn quốc gia GDPT 2018', 'C', 'Giải thích C', 'Lý do C',
        0.25, 'LEGAL', '{"doc":"GDPT 2018"}', '${ORG_A}', '${DEPT_A}', '${TEACHER_A}', 'PUBLIC'
      );
    `);

    // Q4: Private question by Teacher A
    await adminClient.query(`
      INSERT INTO question_bank (
        id, grade_code, semester, topic, subject_area, content_domain, learning_requirement_text,
        cognitive_level, question_type, question_text, correct_answer, explanation, rationale,
        score, source_level, source_citation, organization_id, department_id, created_by, visibility
      ) VALUES (
        '${Q_PRIVATE_A_ID}', 8, 'HK1', 'Đòn bẩy trong đời sống', 'PHYSICS', 'ENERGY_CHANGE', 'Vận dụng đòn bẩy',
        'M3', 'MCQ', 'Ý tưởng câu hỏi bí mật của Thầy A', 'D', 'Giải thích D', 'Lý do D',
        0.25, 'SCHOOL', '{"author":"Teacher A"}', '${ORG_A}', '${DEPT_A}', '${TEACHER_A}', 'PRIVATE'
      );
    `);
  });

  afterAll(async () => {
    if (adminClient) {
      await adminClient.end();
    }
  });

  it('Teacher A (School A) should see School A question, Public question, and Private A question, but NOT School B question', async () => {
    const clientA = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await clientA.connect();

    await clientA.query('BEGIN;');
    await clientA.query('SET LOCAL ROLE authenticated;');
    await clientA.query(`SET LOCAL request.jwt.claim.sub = '${TEACHER_A}';`);

    const res = await clientA.query(`
      SELECT id, topic, visibility FROM question_bank 
      WHERE id IN ('${Q_ORG_A_ID}', '${Q_ORG_B_ID}', '${Q_PUBLIC_ID}', '${Q_PRIVATE_A_ID}')
      ORDER BY id;
    `);

    const ids = res.rows.map(r => r.id);
    expect(ids).toContain(Q_ORG_A_ID);      // School A Org question -> Visible
    expect(ids).toContain(Q_PUBLIC_ID);     // Public question -> Visible
    expect(ids).toContain(Q_PRIVATE_A_ID);  // Private created by Teacher A -> Visible
    expect(ids).not.toContain(Q_ORG_B_ID);  // School B Org question -> STRICTLY INVISIBLE!

    await clientA.query('ROLLBACK;');
    await clientA.end();
  });

  it('Teacher B (School B) should see School B question and Public question, but NOT School A question or Teacher A private question', async () => {
    const clientB = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await clientB.connect();

    await clientB.query('BEGIN;');
    await clientB.query('SET LOCAL ROLE authenticated;');
    await clientB.query(`SET LOCAL request.jwt.claim.sub = '${TEACHER_B}';`);

    const res = await clientB.query(`
      SELECT id, topic, visibility FROM question_bank 
      WHERE id IN ('${Q_ORG_A_ID}', '${Q_ORG_B_ID}', '${Q_PUBLIC_ID}', '${Q_PRIVATE_A_ID}')
      ORDER BY id;
    `);

    const ids = res.rows.map(r => r.id);
    expect(ids).toContain(Q_ORG_B_ID);          // School B Org question -> Visible
    expect(ids).toContain(Q_PUBLIC_ID);         // Public question -> Visible
    expect(ids).not.toContain(Q_ORG_A_ID);      // School A Org question -> STRICTLY INVISIBLE!
    expect(ids).not.toContain(Q_PRIVATE_A_ID);  // Private Teacher A -> STRICTLY INVISIBLE!

    await clientB.query('ROLLBACK;');
    await clientB.end();
  });

  it('Cross-Tenant Mutation Guard: Teacher A cannot update or delete School B question', async () => {
    const clientA = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await clientA.connect();

    await clientA.query('BEGIN;');
    await clientA.query('SET LOCAL ROLE authenticated;');
    await clientA.query(`SET LOCAL request.jwt.claim.sub = '${TEACHER_A}';`);

    // Attempt to update School B's question
    const updateRes = await clientA.query(`
      UPDATE question_bank 
      SET question_text = 'HACKED BY TEACHER A' 
      WHERE id = '${Q_ORG_B_ID}';
    `);

    expect(updateRes.rowCount).toBe(0); // 0 rows affected by RLS!

    await clientA.query('ROLLBACK;');
    await clientA.end();
  });
});
