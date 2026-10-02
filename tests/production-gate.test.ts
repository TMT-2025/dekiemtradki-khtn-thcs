import { describe, it, expect } from 'vitest';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { ContextService } from '@/features/context-engine/context-service';
import { ContextQualityService } from '@/features/context-engine/context-quality-service';
import { TestService } from '@/features/test-generator/test-service';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { SecurityService, UserSession } from '@/features/security/security-service';
import { localDb } from '@/database/local-db';

describe('Phase 7.7 & 7.8: Production Gate & Teacher User Acceptance Test (UAT)', () => {
  it('UAT: should seamlessly execute complete teacher workflow without manual database manipulation', async () => {
    // 1. Teacher Authentication & Session
    const teacher: UserSession = {
      userId: 'TEACHER_HOANG_01',
      email: 'nguyenhoang@thcsphanvantri.edu.vn',
      role: 'TEACHER',
      schoolId: 'THCS_PHAN_VAN_TRI'
    };
    expect(SecurityService.hasPermission(teacher.role, 'GENERATE_TEST')).toBe(true);

    // 2. Select Grade & Lessons Scope (KHTN 7, Semester 1)
    const grade = 7;
    const semester = 'HK1';
    const lessons = CurriculumService.getLessons(grade, semester).slice(0, 5);
    expect(lessons.length).toBeGreaterThanOrEqual(4);

    // 3. Generate Assessment Matrix (10.0 pts)
    const template = localDb.getTemplates()[0];
    const matrix = MatrixEngine.generateMatrix({
      grade,
      schoolYear: '2026-2027',
      semester,
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template,
      contextRatio: 0.5
    });
    expect(matrix.totalScore).toBe(10.0);
    expect(matrix.rows.length).toBe(lessons.length);

    // 4. Generate Test Specification
    const spec = SpecEngine.generateFromMatrix(matrix);
    expect(spec.items.length).toBeGreaterThan(0);
    const specScore = spec.items.reduce((sum, item) => sum + item.score, 0);
    expect(specScore).toBe(10.0);

    // 5. Select Context & Generate Context-First Questions (Workflow B)
    const gradePhenomena = ContextService.filterPhenomena({ grade });
    expect(gradePhenomena.length).toBeGreaterThan(0);

    const chosenPhenom = gradePhenomena[0];
    const newContextQuestion = ContextService.buildQuestionFromPhenomenon(
      chosenPhenom,
      'M2',
      'MCQ',
      chosenPhenom.curriculum_alignment
    );
    expect(newContextQuestion.contextMetadata?.hasContext).toBe(true);

    // 6. Run Context Quality Gate on generated question
    const qGate = ContextQualityService.evaluateQuestion(newContextQuestion);
    expect(qGate.passed).toBe(true);
    expect(qGate.blockingIssues.length).toBe(0);

    // 7. Save to Question Bank
    localDb.saveQuestion(newContextQuestion);
    const retrievedQ = localDb.getQuestions().find(q => q.id === newContextQuestion.id);
    expect(retrievedQ).toBeDefined();

    // 8. Generate Complete Test Examination
    const { test } = await TestService.generateTest({
      matrix,
      specification: spec,
      mode: 'AUTO'
    });
    expect(test.totalScore).toBe(10.0);
    expect(test.parts.length).toBe(4);
    expect(test.answerKeys.length).toBeGreaterThanOrEqual(16);

    // 9. Review Context Report & Diversity
    const contextReport = test.contextReport;
    expect(contextReport).toBeDefined();
    expect(contextReport?.contextPercentage).toBeGreaterThanOrEqual(25);
    expect(contextReport?.qualityStatus).not.toBe('FAIL');

    // 10. Review Traceability
    const sampleTestQuestion = test.parts[0].questions[0].question;
    const trace = sampleTestQuestion.contextMetadata?.trace;
    if (trace) {
      expect(trace.questionId).toBe(sampleTestQuestion.id);
      expect(trace.learningRequirementId).toBeDefined();
    }

    // 11. Run Final End-to-End Quality Gate (Consistent Chain)
    const chainResult = QualityGate.validateChain({
      matrix,
      specification: spec,
      test
    });
    expect(chainResult.passed).toBe(true);
    expect(chainResult.totalErrors).toBe(0);
    expect(chainResult.score).toBeGreaterThanOrEqual(90);

    // 12. Export DOCX Examination Package (All 6 Documents)
    const pkg = await DocxExportService.exportFullPackageDocx({
      matrix,
      specification: spec,
      test
    });

    expect(pkg.matrixDocx.byteLength).toBeGreaterThan(1000);
    expect(pkg.specDocx.byteLength).toBeGreaterThan(1000);
    expect(pkg.testDocx.byteLength).toBeGreaterThan(1000);
    expect(pkg.answerKeyDocx.byteLength).toBeGreaterThan(1000);
    expect(pkg.contextReportDocx.byteLength).toBeGreaterThan(1000);
    expect(pkg.traceabilityReportDocx.byteLength).toBeGreaterThan(1000);
  });

  it('Production Gate: Verifies system health across all 4 grades', () => {
    [6, 7, 8, 9].forEach(g => {
      const lessons = CurriculumService.getLessons(g as any);
      expect(lessons.length).toBeGreaterThan(10);

      const phenomena = ContextService.filterPhenomena({ grade: g as any });
      expect(phenomena.length).toBeGreaterThanOrEqual(2);
    });
  });
});
