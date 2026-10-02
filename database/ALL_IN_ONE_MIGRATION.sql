-- ============================================================
-- KHTN ASSESSMENT STUDIO - SUPABASE / POSTGRESQL SCHEMA
-- Author: Senior Software Architect
-- Subject: Khoa học tự nhiên THCS (GDPT 2018)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE & PERMISSIONS
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    school_name TEXT DEFAULT 'Trường THCS-THPT Phan Văn Trị',
    department TEXT DEFAULT 'Tổ Khoa học tự nhiên',
    role TEXT DEFAULT 'TEACHER' CHECK (role IN ('ADMIN', 'HEAD_OF_DEPARTMENT', 'TEACHER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. KNOWLEDGE BASE DOCUMENTS
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(50) UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    grade VARCHAR(20) NOT NULL,
    subject VARCHAR(20) NOT NULL,
    school_year VARCHAR(30) NOT NULL,
    source_level VARCHAR(20) NOT NULL CHECK (source_level IN ('LEGAL', 'LOCAL', 'SCHOOL', 'TEXTBOOK', 'REFERENCE')),
    effective_date DATE,
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CURRICULUM STRUCTURE
CREATE TABLE IF NOT EXISTS curriculum_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code INTEGER UNIQUE NOT NULL CHECK (code IN (6, 7, 8, 9)),
    name TEXT NOT NULL,
    total_periods INTEGER NOT NULL DEFAULT 140
);

CREATE TABLE IF NOT EXISTS curriculum_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_code INTEGER REFERENCES curriculum_grades(code) ON DELETE CASCADE,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('HK1', 'HK2')),
    chapter_number TEXT NOT NULL,
    title TEXT NOT NULL,
    subject_area VARCHAR(20) NOT NULL CHECK (subject_area IN ('PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'INTEGRATED')),
    content_domain VARCHAR(30) NOT NULL CHECK (content_domain IN ('ENERGY_CHANGE', 'SUBSTANCE_CHANGE', 'LIVING_THINGS', 'EARTH_SPACE', 'INTEGRATED_INTRO')),
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS curriculum_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES curriculum_chapters(id) ON DELETE CASCADE,
    grade_code INTEGER REFERENCES curriculum_grades(code) ON DELETE CASCADE,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('HK1', 'HK2')),
    lesson_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    periods INTEGER NOT NULL CHECK (periods > 0),
    subject_area VARCHAR(20) NOT NULL CHECK (subject_area IN ('PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'INTEGRATED')),
    content_domain VARCHAR(30) NOT NULL CHECK (content_domain IN ('ENERGY_CHANGE', 'SUBSTANCE_CHANGE', 'LIVING_THINGS', 'EARTH_SPACE', 'INTEGRATED_INTRO')),
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    cognitive_level VARCHAR(10) NOT NULL CHECK (cognitive_level IN ('M1', 'M2', 'M3', 'M4')),
    subject_area VARCHAR(20) NOT NULL,
    content_domain VARCHAR(30) NOT NULL,
    source_doc_id VARCHAR(50)
);

-- 4. ASSESSMENT TEMPLATES
CREATE TABLE IF NOT EXISTS assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_score NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    cognitive_level_target JSONB NOT NULL,
    enable_m4 BOOLEAN DEFAULT TRUE,
    parts_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ASSESSMENT MATRICES & ROWS
CREATE TABLE IF NOT EXISTS assessment_matrices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    grade_code INTEGER NOT NULL CHECK (grade_code IN (6, 7, 8, 9)),
    school_year VARCHAR(30) NOT NULL,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('HK1', 'HK2')),
    assessment_type VARCHAR(30) NOT NULL,
    template_id UUID REFERENCES assessment_templates(id),
    duration_minutes INTEGER NOT NULL,
    enable_m4 BOOLEAN DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'ARCHIVED')),
    total_questions INTEGER NOT NULL,
    total_score NUMERIC(4, 2) NOT NULL,
    total_percentage NUMERIC(5, 2) NOT NULL,
    summary_by_domain JSONB,
    summary_by_cognitive JSONB,
    summary_by_question_type JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS matrix_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matrix_id UUID REFERENCES assessment_matrices(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    topic_name TEXT NOT NULL,
    content_unit TEXT NOT NULL,
    lesson_id UUID REFERENCES curriculum_lessons(id),
    subject_area VARCHAR(20) NOT NULL,
    content_domain VARCHAR(30) NOT NULL,
    periods INTEGER NOT NULL,
    weight_percentage NUMERIC(5, 2) NOT NULL,
    
    nb_mcq INTEGER DEFAULT 0,
    th_mcq INTEGER DEFAULT 0,
    vd_mcq INTEGER DEFAULT 0,
    vdc_mcq INTEGER DEFAULT 0,

    nb_tf INTEGER DEFAULT 0,
    th_tf INTEGER DEFAULT 0,
    vd_tf INTEGER DEFAULT 0,
    vdc_tf INTEGER DEFAULT 0,

    nb_sa INTEGER DEFAULT 0,
    th_sa INTEGER DEFAULT 0,
    vd_sa INTEGER DEFAULT 0,
    vdc_sa INTEGER DEFAULT 0,

    nb_es INTEGER DEFAULT 0,
    th_es INTEGER DEFAULT 0,
    vd_es INTEGER DEFAULT 0,
    vdc_es INTEGER DEFAULT 0,

    total_questions INTEGER NOT NULL,
    total_score NUMERIC(4, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    explain_notes JSONB
);

-- 6. TEST SPECIFICATIONS
CREATE TABLE IF NOT EXISTS test_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matrix_id UUID REFERENCES assessment_matrices(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    grade_code INTEGER NOT NULL,
    semester VARCHAR(10) NOT NULL,
    school_year VARCHAR(30) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. QUESTION BANK
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_code INTEGER NOT NULL,
    semester VARCHAR(10) NOT NULL,
    chapter_id UUID REFERENCES curriculum_chapters(id),
    lesson_id UUID REFERENCES curriculum_lessons(id),
    topic TEXT NOT NULL,
    subject_area VARCHAR(20) NOT NULL,
    content_domain VARCHAR(30) NOT NULL,
    learning_requirement_id UUID REFERENCES learning_requirements(id),
    learning_requirement_text TEXT NOT NULL,
    cognitive_level VARCHAR(10) NOT NULL CHECK (cognitive_level IN ('M1', 'M2', 'M3', 'M4')),
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY')),
    difficulty VARCHAR(20) DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    rationale TEXT NOT NULL,
    score NUMERIC(4, 2) NOT NULL,
    source_level VARCHAR(20) NOT NULL,
    source_citation JSONB NOT NULL,
    tags TEXT[],
    quality_report JSONB,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TEST EXAMS & TEST QUESTIONS
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matrix_id UUID REFERENCES assessment_matrices(id) ON DELETE CASCADE,
    specification_id UUID REFERENCES test_specifications(id) ON DELETE CASCADE,
    test_code VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    school_name TEXT NOT NULL,
    department_name TEXT NOT NULL,
    grade_code INTEGER NOT NULL,
    subject_name TEXT NOT NULL DEFAULT 'Khoa học tự nhiên',
    semester VARCHAR(10) NOT NULL,
    school_year VARCHAR(30) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_score NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    parts JSONB NOT NULL,
    answer_keys JSONB NOT NULL,
    scoring_guide JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. QUALITY CHECKS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('MATRIX', 'SPECIFICATION', 'QUESTION', 'TEST')),
    target_id UUID NOT NULL,
    passed BOOLEAN NOT NULL,
    score INTEGER NOT NULL,
    issues JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    payload JSONB,
    model_name TEXT,
    prompt_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active documents" ON knowledge_documents FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Public read curriculum grades" ON curriculum_grades FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read chapters" ON curriculum_chapters FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read lessons" ON curriculum_lessons FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read learning requirements" ON learning_requirements FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read templates" ON assessment_templates FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read question bank" ON question_bank FOR SELECT TO PUBLIC USING (true);
-- ============================================================
-- KHTN ASSESSMENT STUDIO - CURRICULUM SEED DATA (GDPT 2018)
-- Generated automatically from official syllabus & KHDH
-- ============================================================

INSERT INTO curriculum_grades (code, name, total_periods) VALUES
(6, 'Khoa học tự nhiên 6', 140),
(7, 'Khoa học tự nhiên 7', 140),
(8, 'Khoa học tự nhiên 8', 140),
(9, 'Khoa học tự nhiên 9', 140)
ON CONFLICT (code) DO NOTHING;

-- Default Assessment Templates
INSERT INTO assessment_templates (name, code, description, duration_minutes, total_score, cognitive_level_target, enable_m4, parts_config) VALUES
(
  'Cấu trúc chuẩn Sở GD&ĐT Vĩnh Long (CV 984 / CV 7991)',
  'TEMPLATE_B_LOCAL',
  'Cấu trúc 4 phần chuẩn: Phần I (14 MCQ - 3.5đ), Phần II (2 Đ/S - 2.0đ), Phần III (3 TLN - 1.5đ), Phần IV (3 TL - 3.0đ)',
  60,
  10.00,
  '{"M1": 40, "M2": 30, "M3": 20, "M4": 10}'::jsonb,
  true,
  '[
    {"partNumber": 1, "name": "Trắc nghiệm nhiều lựa chọn", "questionType": "MCQ", "questionCount": 14, "scorePerQuestion": 0.25, "totalScore": 3.5, "description": "Mỗi câu có 4 phương án, chọn 1 đáp án đúng."},
    {"partNumber": 2, "name": "Trắc nghiệm Đúng/Sai", "questionType": "TRUE_FALSE", "questionCount": 2, "scorePerQuestion": 1.0, "totalScore": 2.0, "description": "Mỗi câu gồm 4 ý (a, b, c, d), mỗi ý đúng được 0.25đ."},
    {"partNumber": 3, "name": "Trắc nghiệm trả lời ngắn", "questionType": "SHORT_ANSWER", "questionCount": 3, "scorePerQuestion": 0.5, "totalScore": 1.5, "description": "Điền kết quả tính toán hoặc số liệu chính xác."},
    {"partNumber": 4, "name": "Tự luận", "questionType": "ESSAY", "questionCount": 3, "scorePerQuestion": 1.0, "totalScore": 3.0, "description": "Trình bày giải thích, lập luận và bài tập tự luận."}
  ]'::jsonb
),
(
  'Cấu trúc mặc định hệ thống (Template A - Trắc nghiệm & Tự luận cân bằng)',
  'TEMPLATE_A',
  'Cấu trúc kết hợp Trắc nghiệm nhiều lựa chọn (16 câu - 4.0đ) và Tự luận (4 câu - 6.0đ)',
  60,
  10.00,
  '{"M1": 40, "M2": 30, "M3": 20, "M4": 10}'::jsonb,
  true,
  '[
    {"partNumber": 1, "name": "Trắc nghiệm nhiều lựa chọn", "questionType": "MCQ", "questionCount": 16, "scorePerQuestion": 0.25, "totalScore": 4.0, "description": "16 câu trắc nghiệm nhiều lựa chọn (12 NB, 4 TH)"},
    {"partNumber": 2, "name": "Tự luận", "questionType": "ESSAY", "questionCount": 4, "scorePerQuestion": 1.5, "totalScore": 6.0, "description": "4 câu tự luận (NB 1.0đ, TH 2.0đ, VD 2.0đ, VDC 1.0đ)"}
  ]'::jsonb
)
ON CONFLICT (code) DO NOTHING;
-- ============================================================
-- KHTN ASSESSMENT STUDIO - CONTEXT ENGINE & TRACEABILITY SCHEMA
-- Author: Senior Software Architect & Assessment Specialist
-- Phase 7.5: Supabase Production Readiness
-- ============================================================

-- 1. PHENOMENON LIBRARY
CREATE TABLE IF NOT EXISTS phenomena (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phenomenon_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade IN (6, 7, 8, 9)),
    topic TEXT NOT NULL,
    subject_area VARCHAR(20) NOT NULL CHECK (subject_area IN ('PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'INTEGRATED')),
    content_domain VARCHAR(30) NOT NULL,
    context_type VARCHAR(30) NOT NULL CHECK (context_type IN ('PERSONAL', 'FAMILY_SCHOOL', 'LOCAL', 'NATIONAL', 'GLOBAL')),
    application_area VARCHAR(30) NOT NULL,
    context_level VARCHAR(10) NOT NULL CHECK (context_level IN ('C1', 'C2', 'C3', 'C4')),
    difficulty VARCHAR(10) DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    stimulus JSONB,
    source TEXT NOT NULL,
    source_url TEXT,
    source_country TEXT DEFAULT 'Việt Nam',
    source_language VARCHAR(10) DEFAULT 'vi',
    age_range VARCHAR(30) DEFAULT '11-15 tuổi',
    curriculum_alignment TEXT,
    quality_status VARCHAR(20) DEFAULT 'APPROVED' CHECK (quality_status IN ('DRAFT', 'VERIFIED', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. INTERNATIONAL CONTEXTS
CREATE TABLE IF NOT EXISTS international_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    country TEXT NOT NULL,
    organization TEXT NOT NULL,
    url TEXT NOT NULL,
    source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('INSPIRED_BY', 'ADAPTED_FROM', 'DIRECT_SOURCE')),
    scientific_topic TEXT,
    grade INTEGER NOT NULL CHECK (grade IN (6, 7, 8, 9)),
    age_range VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    original_language VARCHAR(10) DEFAULT 'en',
    translated_text TEXT,
    adapted_context TEXT NOT NULL,
    application_area VARCHAR(30) NOT NULL,
    context_type VARCHAR(30) NOT NULL,
    context_level VARCHAR(10) NOT NULL,
    license TEXT NOT NULL,
    copyright_status TEXT,
    verified BOOLEAN DEFAULT true,
    curriculum_alignment TEXT,
    date_checked DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CONTEXT STIMULI & DATASETS
CREATE TABLE IF NOT EXISTS context_stimuli (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stimulus_id VARCHAR(50) UNIQUE NOT NULL,
    context_id VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('TEXT', 'TABLE', 'CHART', 'GRAPH', 'IMAGE', 'DIAGRAM', 'EXPERIMENT', 'RESEARCH_ABSTRACT', 'OBSERVATION', 'DATASET', 'NEWS_SCENARIO', 'MULTI_SOURCE')),
    title TEXT,
    content TEXT NOT NULL,
    data JSONB,
    experiment JSONB,
    reading_load VARCHAR(10) DEFAULT 'LOW' CHECK (reading_load IN ('LOW', 'MEDIUM', 'HIGH')),
    is_synthetic BOOLEAN DEFAULT false,
    source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    localization_status VARCHAR(30) DEFAULT 'LOCALIZED',
    quality_status VARCHAR(20) DEFAULT 'PASSED' CHECK (quality_status IN ('DRAFT', 'PASSED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CONTEXT TRACES (Section 22 Provenance & Audit)
CREATE TABLE IF NOT EXISTS context_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id VARCHAR(100) NOT NULL,
    stimulus_id VARCHAR(100),
    context_id VARCHAR(100) NOT NULL,
    phenomenon_id VARCHAR(100),
    source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_requirement_id TEXT NOT NULL,
    specification_id VARCHAR(100) NOT NULL,
    matrix_cell_id VARCHAR(100) NOT NULL,
    test_id VARCHAR(100),
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_phenomena_grade_subject ON phenomena(grade, subject_area);
CREATE INDEX IF NOT EXISTS idx_phenomena_context_type ON phenomena(context_type);
CREATE INDEX IF NOT EXISTS idx_phenomena_app_area ON phenomena(application_area);
CREATE INDEX IF NOT EXISTS idx_intl_org ON international_contexts(organization);
CREATE INDEX IF NOT EXISTS idx_stimuli_context_id ON context_stimuli(context_id);
CREATE INDEX IF NOT EXISTS idx_traces_question ON context_traces(question_id);
CREATE INDEX IF NOT EXISTS idx_traces_test ON context_traces(test_id);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE phenomena ENABLE ROW LEVEL SECURITY;
ALTER TABLE international_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_stimuli ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_traces ENABLE ROW LEVEL SECURITY;

-- Read policies: Teachers and Admins can view verified contexts
CREATE POLICY "Public read approved phenomena" ON phenomena 
    FOR SELECT TO PUBLIC USING (quality_status = 'APPROVED' OR quality_status = 'VERIFIED');

CREATE POLICY "Public read verified international contexts" ON international_contexts 
    FOR SELECT TO PUBLIC USING (verified = true);

CREATE POLICY "Public read passed stimuli" ON context_stimuli 
    FOR SELECT TO PUBLIC USING (quality_status = 'PASSED');

CREATE POLICY "Authenticated users read traces" ON context_traces 
    FOR SELECT TO authenticated USING (true);

-- Mutation policies: Only authenticated teachers/admins can create/modify
CREATE POLICY "Teachers can insert traces" ON context_traces 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Teachers can update their stimuli" ON context_stimuli 
    FOR ALL TO authenticated USING (true);

-- 7. AUDIT & UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_phenomena_updated_at ON phenomena;
CREATE TRIGGER trg_phenomena_updated_at
    BEFORE UPDATE ON phenomena
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_context_stimuli_updated_at ON context_stimuli;
CREATE TRIGGER trg_context_stimuli_updated_at
    BEFORE UPDATE ON context_stimuli
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- KHTN ASSESSMENT STUDIO - MULTI-TENANT ARCHITECTURE SCHEMA
-- Migration: 004_multi_tenant_organizations.sql
-- Hierarchy: Organizations (Schools) -> Departments -> Memberships -> Teachers
-- Multi-School, Multi-Department, RBAC & PostgreSQL Row Level Security (RLS)
-- ============================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS (Trường học)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    province VARCHAR(100) DEFAULT 'Thành phố Cần Thơ',
    district VARCHAR(100) DEFAULT 'Huyện Phong Điền',
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. DEPARTMENTS (Tổ chuyên môn)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL,
    subject_area VARCHAR(50) DEFAULT 'KHTN',
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_org_dept_code UNIQUE (organization_id, code)
);

-- 3. MEMBERSHIPS & RBAC (Phân quyền thành viên trường & tổ)
-- 5 Roles supported:
-- super_admin  : Quản trị viên hệ thống toàn quyền
-- school_admin : Ban giám hiệu / Quản trị viên cấp trường
-- dept_head    : Tổ trưởng chuyên môn
-- vice_head    : Tổ phó chuyên môn
-- teacher      : Giáo viên bộ môn KHTN
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'dept_head', 'vice_head', 'teacher')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_user_org_dept_role UNIQUE (user_id, organization_id, department_id, role)
);

-- 4. TEACHING ASSIGNMENTS (Phân công giảng dạy theo khối & phân môn)
CREATE TABLE IF NOT EXISTS teaching_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    grade_code INTEGER NOT NULL CHECK (grade_code IN (6, 7, 8, 9)),
    subject_area VARCHAR(30) NOT NULL CHECK (subject_area IN ('PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'INTEGRATED', 'GENERAL')),
    academic_year VARCHAR(30) NOT NULL,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('HK1', 'HK2', 'FULL_YEAR')),
    class_names TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. NON-DESTRUCTIVE COLUMN EXTENSIONS FOR TENANT SCOPING
-- A. question_bank
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'organization_id') THEN
        ALTER TABLE question_bank ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'department_id') THEN
        ALTER TABLE question_bank ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'created_by') THEN
        ALTER TABLE question_bank ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'visibility') THEN
        ALTER TABLE question_bank ADD COLUMN visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'ORGANIZATION', 'DEPARTMENT', 'PRIVATE'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'status') THEN
        ALTER TABLE question_bank ADD COLUMN status VARCHAR(20) DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ARCHIVED'));
    END IF;
END $$;

-- B. assessment_matrices
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_matrices' AND column_name = 'organization_id') THEN
        ALTER TABLE assessment_matrices ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_matrices' AND column_name = 'department_id') THEN
        ALTER TABLE assessment_matrices ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_matrices' AND column_name = 'created_by') THEN
        ALTER TABLE assessment_matrices ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_matrices' AND column_name = 'is_public_template') THEN
        ALTER TABLE assessment_matrices ADD COLUMN is_public_template BOOLEAN DEFAULT false;
    END IF;
END $$;

-- C. tests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tests' AND column_name = 'organization_id') THEN
        ALTER TABLE tests ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tests' AND column_name = 'department_id') THEN
        ALTER TABLE tests ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tests' AND column_name = 'created_by') THEN
        ALTER TABLE tests ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_dept_org_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON memberships(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE INDEX IF NOT EXISTS idx_teaching_assign ON teaching_assignments(teacher_id, organization_id, grade_code);
CREATE INDEX IF NOT EXISTS idx_qbank_org_vis ON question_bank(organization_id, visibility);
CREATE INDEX IF NOT EXISTS idx_qbank_created_by ON question_bank(created_by);
CREATE INDEX IF NOT EXISTS idx_matrices_org ON assessment_matrices(organization_id);
CREATE INDEX IF NOT EXISTS idx_tests_org ON tests(organization_id);

-- 7. SECURITY FUNCTIONS FOR RLS ENFORCEMENT
CREATE OR REPLACE FUNCTION auth_user_has_org_role(lookup_org_id UUID, lookup_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.user_id = auth.uid()
          AND m.status = 'ACTIVE'
          AND (
            m.role = 'super_admin'
            OR (m.organization_id = lookup_org_id AND m.role = ANY(lookup_roles))
          )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id FROM memberships
    WHERE user_id = auth.uid() AND status = 'ACTIVE'
    UNION
    SELECT id FROM organizations
    WHERE EXISTS (
        SELECT 1 FROM memberships
        WHERE user_id = auth.uid() AND role = 'super_admin' AND status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ROW LEVEL SECURITY (RLS) ACTIVATION & POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Public read active organizations" ON organizations
    FOR SELECT TO PUBLIC USING (status = 'ACTIVE');

CREATE POLICY "School admin manage own organization" ON organizations
    FOR ALL TO authenticated
    USING (auth_user_has_org_role(id, ARRAY['super_admin', 'school_admin']));

-- Departments policies
CREATE POLICY "Members view organization departments" ON departments
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth_user_org_ids()));

CREATE POLICY "School admin manage departments" ON departments
    FOR ALL TO authenticated
    USING (auth_user_has_org_role(organization_id, ARRAY['super_admin', 'school_admin']));

-- Memberships policies
CREATE POLICY "Users view colleagues in same organization" ON memberships
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth_user_org_ids()));

CREATE POLICY "School admin manage memberships" ON memberships
    FOR ALL TO authenticated
    USING (auth_user_has_org_role(organization_id, ARRAY['super_admin', 'school_admin']));

-- Teaching assignments policies
CREATE POLICY "Users view assignments in own organization" ON teaching_assignments
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth_user_org_ids()));

CREATE POLICY "School and Dept heads manage assignments" ON teaching_assignments
    FOR ALL TO authenticated
    USING (auth_user_has_org_role(organization_id, ARRAY['super_admin', 'school_admin', 'dept_head']));

-- Multi-Tenant Question Bank Isolation Policy
CREATE POLICY "Multi-tenant question read policy" ON question_bank
    FOR SELECT TO authenticated
    USING (
        visibility = 'PUBLIC'
        OR created_by = auth.uid()
        OR organization_id IN (SELECT auth_user_org_ids())
    );

CREATE POLICY "Teachers insert questions for their organization" ON question_bank
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = auth.uid()
        AND (organization_id IS NULL OR organization_id IN (SELECT auth_user_org_ids()))
    );

CREATE POLICY "Teachers update their own questions or dept heads manage org questions" ON question_bank
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR auth_user_has_org_role(organization_id, ARRAY['super_admin', 'school_admin', 'dept_head'])
    );

-- Multi-Tenant Matrices & Tests Isolation Policy
CREATE POLICY "Multi-tenant matrix access" ON assessment_matrices
    FOR ALL TO authenticated
    USING (
        is_public_template = true
        OR created_by = auth.uid()
        OR organization_id IN (SELECT auth_user_org_ids())
    );

CREATE POLICY "Multi-tenant tests access" ON tests
    FOR ALL TO authenticated
    USING (
        created_by = auth.uid()
        OR organization_id IN (SELECT auth_user_org_ids())
    );

-- 9. SEED DEFAULT BASELINE TENANT (THCS-THPT Phan Văn Trị)
INSERT INTO organizations (id, name, code, province, district)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Trường THCS-THPT Phan Văn Trị',
    'THCS_THPT_PHAN_VAN_TRI',
    'Thành phố Cần Thơ',
    'Huyện Phong Điền'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (id, organization_id, name, code, subject_area)
VALUES (
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Tổ Khoa học tự nhiên',
    'TO_KHTN_PVT',
    'KHTN'
) ON CONFLICT (organization_id, code) DO NOTHING;

-- Link existing unassigned questions, matrices, tests to default school
UPDATE question_bank 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid,
    visibility = 'PUBLIC'
WHERE organization_id IS NULL;

UPDATE assessment_matrices 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE organization_id IS NULL;

UPDATE tests 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE organization_id IS NULL;
