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
