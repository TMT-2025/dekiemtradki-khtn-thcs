import { describe, it, expect } from 'vitest';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { TestService } from '@/features/test-generator/test-service';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { localDb } from '@/database/local-db';
import { GradeLevel } from '@/types/curriculum';

describe('Phase 7.1: Full System Integration (KHTN 6, 7, 8, 9)', () => {
  const grades: GradeLevel[] = [6, 7, 8, 9];

  grades.forEach(grade => {
    it(`should execute complete end-to-end pipeline and generate 6-document package for KHTN ${grade}`, async () => {
      // 1. Curriculum Scope Selection
      const lessons = CurriculumService.getLessons(grade, 'HK1').slice(0, 6);
      expect(lessons.length).toBeGreaterThan(0);
      const template = localDb.getTemplates()[0];

      // 2. Matrix Generation
      const matrix = MatrixEngine.generateMatrix({
        grade,
        schoolYear: '2026-2027',
        semester: 'HK1',
        assessmentType: 'MID_TERM_1',
        selectedLessonIds: lessons.map(l => l.id),
        template,
        contextRatio: 0.5 // 50% target
      });
      expect(matrix).toBeDefined();
      expect(matrix.totalScore).toBe(10.0);
      expect(matrix.totalQuestions).toBeGreaterThan(15);

      // 3. Specification Generation
      const spec = SpecEngine.generateFromMatrix(matrix);
      expect(spec).toBeDefined();
      expect(spec.items.length).toBeGreaterThan(0);

      // 4. Test Generation (with Context, Stimulus, Question Bank & AI matching)
      const { test } = await TestService.generateTest({
        matrix,
        specification: spec,
        mode: 'AUTO'
      });

      expect(test).toBeDefined();
      expect(test.totalScore).toBe(10.0);
      expect(test.parts.length).toBe(4);
      expect(test.answerKeys.length).toBe(test.totalScore > 0 ? matrix.totalQuestions : 0);
      expect(test.scoringGuide.instructions.length).toBeGreaterThan(0);

      // 5. Context Report & Diversity Validation
      expect(test.contextReport).toBeDefined();
      expect(test.contextReport?.contextPercentage).toBeGreaterThanOrEqual(25);
      expect(test.contextReport?.crossAnalysis).toBeDefined();

      // 6. Quality Gate Verification (End-to-End Chain)
      const gateResult = QualityGate.validateChain({
        matrix,
        specification: spec,
        test
      });

      expect(gateResult.passed).toBe(true);
      expect(gateResult.totalErrors).toBe(0);
      expect(gateResult.score).toBeGreaterThanOrEqual(90);

      // 7. DOCX Package Generation (All 6 Required Documents)
      const fullPackage = await DocxExportService.exportFullPackageDocx({
        matrix,
        specification: spec,
        test
      });

      expect(fullPackage.matrixDocx).toBeDefined();
      expect(fullPackage.matrixDocx.length).toBeGreaterThan(1000); // 01_Ma_tran

      expect(fullPackage.specDocx).toBeDefined();
      expect(fullPackage.specDocx.length).toBeGreaterThan(1000); // 02_Ban_dac_ta

      expect(fullPackage.testDocx).toBeDefined();
      expect(fullPackage.testDocx.length).toBeGreaterThan(1000); // 03_De_kiem_tra

      expect(fullPackage.answerKeyDocx).toBeDefined();
      expect(fullPackage.answerKeyDocx.length).toBeGreaterThan(1000); // 04_Dap_an

      expect(fullPackage.contextReportDocx).toBeDefined();
      expect(fullPackage.contextReportDocx.length).toBeGreaterThan(1000); // 05_Context_Report

      expect(fullPackage.traceabilityReportDocx).toBeDefined();
      expect(fullPackage.traceabilityReportDocx.length).toBeGreaterThan(1000); // 06_Traceability_Report
    });
  });
});
