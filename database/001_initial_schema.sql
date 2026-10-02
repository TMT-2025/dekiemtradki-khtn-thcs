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
