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

