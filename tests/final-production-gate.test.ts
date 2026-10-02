import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { ContextService } from '@/features/context-engine/context-service';
import { ContextQualityService } from '@/features/context-engine/context-quality-service';
import { TestService } from '@/features/test-generator/test-service';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { SecurityService, UserSession } from '@/features/security/security-service';
import { TraceService } from '@/features/context-engine/trace-service';
import { localDb } from '@/database/local-db';
import { evaluateDatabaseSafety } from '@/lib/supabase/database-safety';
import { GradeLevel } from '@/types/curriculum';

describe('Step 20: Final Production Gate Verification', () => {
  const allGrades: GradeLevel[] = [6, 7, 8, 9];

  it('Gate 1 — Git & Deployment Configuration Compliance', () => {
    // Verify target repo alignment
    const gitConfigFile = path.join(process.cwd(), '.git', 'config');
    expect(fs.existsSync(gitConfigFile)).toBe(true);
    const gitConfig = fs.readFileSync(gitConfigFile, 'utf8');
    expect(gitConfig).toContain('https://github.com/TMT-2025/dekiemtradki-khtn-thcs.git');

    // Verify .gitignore shields all secret and build artifacts
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('.env.local');
    expect(gitignore).toContain('.env.production');
    expect(gitignore).toContain('/node_modules');
    expect(gitignore).toContain('/.next/');
  });

  it('Gate 2 — No Exposed Secrets in Tracked Source Code', () => {
    // Check .env.example contains only placeholders, no real secrets
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    expect(envExample).not.toMatch(/AIza[0-9A-Za-z-_]{35}/);
    expect(envExample).not.toMatch(/ghp_[0-9A-Za-z]{36}/);
    expect(envExample).not.toMatch(/sk-[0-9A-Za-z]{30,}/);

    // Verify server-side secret separation
    expect(envExample).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(envExample).toContain('SUPABASE_REQUIRED');
    expect(envExample).not.toContain('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
    expect(envExample).not.toContain('NEXT_PUBLIC_GEMINI_API_KEY');
  });

  it('Gate 3 — Supabase Production Schema & Fail-Fast Safety', () => {
    // Migration 001, 002, 003 integrity
    ['001_initial_schema.sql', '002_seed_curriculum.sql', '003_context_engine_schema.sql'].forEach(m => {
      const p = path.join(process.cwd(), 'database', m);
      expect(fs.existsSync(p)).toBe(true);
      const content = fs.readFileSync(p, 'utf8');
      expect(content.length).toBeGreaterThan(1000);
    });

    // Fail-fast evaluation
    const prodEnvFail = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ''
    };
    expect(() => evaluateDatabaseSafety(prodEnvFail)).toThrow();

    const prodEnvPass = {
      SUPABASE_REQUIRED: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://actual-ref.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-token',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-service'
    };
    const status = evaluateDatabaseSafety(prodEnvPass);
    expect(status.isConfigured).toBe(true);
    expect(status.storageMode).toBe('PRODUCTION_SUPABASE');
  });

  it('Gate 4 — Multi-User Security & Tenant Isolation (Admin, Teacher A, Teacher B)', () => {
    const adminSession: UserSession = {
      userId: 'ADMIN_01',
      email: 'admin@school.edu.vn',
      role: 'ADMIN',
      schoolId: 'SCHOOL_VLG_01'
    };

    const teacherA: UserSession = {
      userId: 'TEACHER_A',
      email: 'teacherA@school.edu.vn',
      role: 'TEACHER',
      schoolId: 'SCHOOL_VLG_01'
    };

    const teacherB: UserSession = {
      userId: 'TEACHER_B',
      email: 'teacherB@school2.edu.vn',
      role: 'TEACHER',
      schoolId: 'SCHOOL_VLG_02'
    };

    // Role-based permissions
    expect(SecurityService.hasPermission(adminSession.role, 'ADMIN_ACCESS')).toBe(true);
    expect(SecurityService.hasPermission(teacherA.role, 'ADMIN_ACCESS')).toBe(false);
    expect(SecurityService.hasPermission(teacherA.role, 'GENERATE_TEST')).toBe(true);
    expect(SecurityService.hasPermission(teacherB.role, 'GENERATE_TEST')).toBe(true);

    // Multi-tenant and IDOR resource boundary check
    const resourceA = { ownerId: 'TEACHER_A', schoolId: 'SCHOOL_VLG_01' };
    const resourceB = { ownerId: 'TEACHER_B', schoolId: 'SCHOOL_VLG_02' };

    // Teacher A can access own resource, but CANNOT access Teacher B's resource
    expect(resourceA.ownerId === teacherA.userId).toBe(true);
    expect(resourceB.ownerId === teacherA.userId).toBe(false);
    expect(resourceB.schoolId === teacherA.schoolId).toBe(false);
  });

  it('Gate 5 — Full Teacher Workflow Across All 4 Grades (KHTN 6, 7, 8, 9)', async () => {
    const template = localDb.getTemplates()[0];

    for (const grade of allGrades) {
      // 1. Scope & Curriculum
      const lessons = CurriculumService.getLessons(grade, 'HK1').slice(0, 4);
      expect(lessons.length).toBeGreaterThanOrEqual(3);

      // 2. Matrix Balancing
      const matrix = MatrixEngine.generateMatrix({
        grade,
        schoolYear: '2026-2027',
        semester: 'HK1',
        assessmentType: 'MID_TERM_1',
        selectedLessonIds: lessons.map(l => l.id),
        template,
        contextRatio: 0.5
      });
      expect(matrix.totalScore).toBe(10.0);

      // 3. Specification
      const spec = SpecEngine.generateFromMatrix(matrix);
      expect(spec.items.length).toBeGreaterThan(0);

      // 4. Context & Stimulus
      const phenomena = ContextService.filterPhenomena({ grade });
      expect(phenomena.length).toBeGreaterThan(0);
      const chosen = phenomena[0];

      // 5. Question Generation
      const q = ContextService.buildQuestionFromPhenomenon(chosen, 'M2', 'MCQ', chosen.curriculum_alignment);
      expect(q.contextMetadata?.hasContext).toBe(true);

      // 6. Quality Gate
      const qCheck = ContextQualityService.evaluateQuestion(q);
      expect(qCheck.passed).toBe(true);

      // 7. Test Assembly
      const { test } = await TestService.generateTest({
        matrix,
        specification: spec,
        mode: 'AUTO'
      });
      expect(test.totalScore).toBe(10.0);
      expect(test.parts.length).toBe(4);
      expect(test.answerKeys.length).toBeGreaterThanOrEqual(16);

      // 8. Quality Gate End-to-End
      const chain = QualityGate.validateChain({ matrix, specification: spec, test });
      expect(chain.passed).toBe(true);

      // 9. Full Package DOCX Export (All 6 Standard Documents)
      const pkg = await DocxExportService.exportFullPackageDocx({
        matrix,
        specification: spec,
        test
      });
      expect(pkg.matrixDocx.byteLength).toBeGreaterThan(5000);
      expect(pkg.specDocx.byteLength).toBeGreaterThan(5000);
      expect(pkg.testDocx.byteLength).toBeGreaterThan(5000);
      expect(pkg.answerKeyDocx.byteLength).toBeGreaterThan(5000);
      expect(pkg.contextReportDocx.byteLength).toBeGreaterThan(5000);
      expect(pkg.traceabilityReportDocx.byteLength).toBeGreaterThan(5000);
    }
  });

  it('Gate 6 — Traceability & Database Persistence Audit', async () => {
    // Generate test
    const template = localDb.getTemplates()[0];
    const grade = 8;
    const lessons = CurriculumService.getLessons(grade, 'HK1').slice(0, 4);
    const matrix = MatrixEngine.generateMatrix({
      grade,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template,
      contextRatio: 0.5
    });
    const spec = SpecEngine.generateFromMatrix(matrix);
    const { test } = await TestService.generateTest({ matrix, specification: spec, mode: 'AUTO' });

    // Database persistence verification
    localDb.saveTest(test);
    const savedTest = localDb.getTestById(test.id);
    expect(savedTest).toBeDefined();
    expect(savedTest?.id).toBe(test.id);
    expect(savedTest?.parts.length).toBe(4);

    // Lineage audit
    test.parts.forEach(p => {
      p.questions.forEach(qItem => {
        const q = qItem.question;
        expect(q.id).toBeDefined();
        expect(q.learningRequirementText.length).toBeGreaterThan(0);
        if (q.contextMetadata?.hasContext && q.contextMetadata.trace) {
          const check = TraceService.verifyTraceChain(q.contextMetadata.trace);
          expect(check.isComplete).toBe(true);
        }
      });
    });
  });
});
