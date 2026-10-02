import { describe, it, expect } from 'vitest';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { TestService } from '@/features/test-generator/test-service';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { XlsxExportService } from '@/features/export-engine/xlsx-export';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { localDb } from '@/database/local-db';
import { GradeLevel } from '@/types/curriculum';

describe('E2E Full Workflow Across All 4 Grades (KHTN 6, 7, 8, 9)', () => {
  const grades: GradeLevel[] = [6, 7, 8, 9];
  const template = localDb.getTemplates()[0]; // Official CV 984 Template

  grades.forEach(grade => {
    it(`should successfully execute full pipeline for KHTN ${grade}: Scope -> Matrix -> Spec -> Test -> QualityGate -> Export`, async () => {
      // 1. Select lessons for this grade
      const allGradeLessons = CurriculumService.getLessons(grade, 'HK1');
      expect(allGradeLessons.length).toBeGreaterThan(0);
      const selectedLessons = allGradeLessons.slice(0, 7);

      // 2. Step 1-16: Generate Matrix
      const matrix = MatrixEngine.generateMatrix({
        grade,
        schoolYear: '2026–2027',
        semester: 'HK1',
        assessmentType: 'MID_TERM_1',
        title: `Đề kiểm tra Giữa HKI KHTN ${grade}`,
        selectedLessonIds: selectedLessons.map(l => l.id),
        template,
        enableM4: true
      });

      expect(matrix.totalScore).toBe(10.0);
      expect(matrix.totalPercentage).toBe(100.0);
      expect(matrix.totalQuestions).toBe(22); // 14 MCQ, 2 TF, 3 SA, 3 Essay

      // 3. Generate 1:1 Specification
      const spec = SpecEngine.generateFromMatrix(matrix);
      expect(spec.items.length).toBeGreaterThan(0);
      expect(spec.items.reduce((s, it) => s + it.questionCount, 0)).toBe(22);

      // 4. Assemble Test with Constraint Matching
      const { test, matchingResults } = await TestService.generateTest({
        matrix,
        specification: spec,
        testCode: `10${grade}`,
        mode: 'AUTO'
      });

      expect(test.parts.length).toBe(4);
      expect(test.answerKeys.length).toBe(22);
      expect(test.scoringGuide.rubrics.length).toBeGreaterThan(0);

      // 5. Run Quality Gate (14 rules)
      const gateResult = QualityGate.validateChain({
        matrix,
        specification: spec,
        test
      });

      expect(gateResult.passed).toBe(true);
      expect(gateResult.totalErrors).toBe(0);

      // 6. Export all 5 official Word files
      const f1 = await DocxExportService.exportMatrixDocx(matrix);
      const f2 = await DocxExportService.exportSpecificationDocx(spec);
      const f3 = await DocxExportService.exportTestDocx(test);
      const f4 = await DocxExportService.exportAnswerKeyDocx(test);
      const f5 = await DocxExportService.exportScoringGuideDocx(test);

      expect(f1.length).toBeGreaterThan(1000);
      expect(f2.length).toBeGreaterThan(1000);
      expect(f3.length).toBeGreaterThan(1000);
      expect(f4.length).toBeGreaterThan(1000);
      expect(f5.length).toBeGreaterThan(1000);

      // 7. Export Excel files
      const xlsxMatrix = await XlsxExportService.exportMatrixXlsx(matrix);
      expect(xlsxMatrix.length).toBeGreaterThan(500);
    });
  });
});
