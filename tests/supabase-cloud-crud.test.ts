import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const isConfigured = !!supabaseUrl && !!serviceRoleKey && !supabaseUrl.includes('mock');

describe.skipIf(!isConfigured)('Phase 8 & 9: Supabase Cloud Live Question CRUD & Persistence', () => {
  const adminClient = isConfigured ? createClient(supabaseUrl, serviceRoleKey) : null as any;

  const TEST_QUESTION_ID = 'd0000000-0000-0000-0000-000000000001';
  const ORG_A_ID = 'a0000000-0000-0000-0000-000000000001';
  const DEPT_A_ID = 'b0000000-0000-0000-0000-000000000001';
  const TEACHER_A_ID = 'e0000000-0000-0000-0000-00000000000a';

  it('1. CREATE Question on Supabase Cloud', async () => {
    // Clean up if existing
    await adminClient.from('question_bank').delete().eq('id', TEST_QUESTION_ID);

    const newQuestion = {
      id: TEST_QUESTION_ID,
      grade_code: 8,
      semester: 'HK1',
      topic: 'Sự truyền nhiệt và dẫn nhiệt',
      subject_area: 'PHYSICS',
      content_domain: 'ENERGY_CHANGE',
      learning_requirement_text: 'Lấy được ví dụ về sự dẫn nhiệt trong đời sống',
      cognitive_level: 'M2',
      question_type: 'MCQ',
      difficulty: 'MEDIUM',
      question_text: 'Tại sao tay cầm của xoong nồi thường làm bằng gỗ hoặc nhựa chịu nhiệt?',
      options: [
        { key: 'A', text: 'Vì gỗ và nhựa dẫn nhiệt kém, giúp tránh bị bỏng khi cầm' },
        { key: 'B', text: 'Vì gỗ và nhựa dẫn nhiệt tốt, làm thức ăn mau chín hơn' },
        { key: 'C', text: 'Vì gỗ và nhựa có khối lượng riêng lớn hơn kim loại' },
        { key: 'D', text: 'Vì gỗ và nhựa không bị nở vì nhiệt khi đun nấu' }
      ],
      correct_answer: 'A',
      explanation: 'Gỗ và nhựa là chất dẫn nhiệt kém nên khi cầm vào sẽ không bị nóng hay bỏng.',
      rationale: 'Học sinh hiểu được ứng dụng thực tiễn của sự dẫn nhiệt (M2).',
      score: 0.25,
      source_level: 'SCHOOL',
      source_citation: { school: 'Trường THCS-THPT Phan Văn Trị', year: '2026' },
      organization_id: ORG_A_ID,
      department_id: DEPT_A_ID,
      created_by: TEACHER_A_ID,
      visibility: 'ORGANIZATION',
      status: 'APPROVED'
    };

    const { data, error } = await adminClient.from('question_bank').insert(newQuestion).select();
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data![0].id).toBe(TEST_QUESTION_ID);
  });

  it('2. READ Question from Supabase Cloud', async () => {
    const { data, error } = await adminClient
      .from('question_bank')
      .select('*')
      .eq('id', TEST_QUESTION_ID)
      .single();

    expect(error).toBeNull();
    expect(data.id).toBe(TEST_QUESTION_ID);
    expect(data.topic).toBe('Sự truyền nhiệt và dẫn nhiệt');
    expect(data.correct_answer).toBe('A');
    expect(data.organization_id).toBe(ORG_A_ID);
  });

  it('3. UPDATE Question on Supabase Cloud', async () => {
    const updatedExplanation = 'Giải thích cập nhật: Gỗ và nhựa là các chất cách nhiệt tốt, bảo đảm an toàn khi nấu nướng.';
    const { data, error } = await adminClient
      .from('question_bank')
      .update({ explanation: updatedExplanation })
      .eq('id', TEST_QUESTION_ID)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.explanation).toBe(updatedExplanation);
  });

  it('4. PERSISTENCE Verification: Question remains in Cloud across new connections', async () => {
    // Create a new fresh client instance to simulate reload
    const freshClient = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await freshClient
      .from('question_bank')
      .select('id, topic, explanation, organization_id')
      .eq('id', TEST_QUESTION_ID)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.id).toBe(TEST_QUESTION_ID);
    expect(data!.explanation).toContain('cách nhiệt tốt');
  });

  it('5. DELETE Question from Supabase Cloud', async () => {
    const { error } = await adminClient
      .from('question_bank')
      .delete()
      .eq('id', TEST_QUESTION_ID);

    expect(error).toBeNull();

    // Verify deletion
    const { data } = await adminClient
      .from('question_bank')
      .select('id')
      .eq('id', TEST_QUESTION_ID);

    expect(data?.length).toBe(0);
  });
});
