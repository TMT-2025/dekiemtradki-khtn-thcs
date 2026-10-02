import { describe, it, expect } from 'vitest';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { TestService } from '@/features/test-generator/test-service';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { localDb } from '@/database/local-db';

describe('TestService & QualityGate (End-to-End Chain Consistency)', () => {
  it('should validate complete chain: YCCĐ -> Matrix -> Spec -> Test -> Answer -> Scoring Guide', async () => {
    const lessons = CurriculumService.getLessons(6, 'HK1').slice(0, 8);
    const template = localDb.getTemplates()[0];

    // 1. Generate Matrix
    const matrix = MatrixEngine.generateMatrix({
      grade: 6,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template
    });

    // 2. Generate Spec
    const spec = SpecEngine.generateFromMatrix(matrix);

    // 3. Generate Test
    const { test } = await TestService.generateTest({
      matrix,
      specification: spec,
      mode: 'AUTO'
    });

    expect(test).toBeDefined();
    expect(test.totalScore).toBe(10.0);
    expect(test.parts.length).toBeGreaterThanOrEqual(2);
    expect(test.answerKeys.length).toBeGreaterThan(0);
    expect(test.scoringGuide.instructions.length).toBeGreaterThan(0);

    // 4. Run Quality Gate
    const gateResult = QualityGate.validateChain({
      matrix,
      specification: spec,
      test
    });

    expect(gateResult.passed).toBe(true);
    expect(gateResult.totalErrors).toBe(0);
    expect(gateResult.score).toBeGreaterThanOrEqual(90);
  });

  it('should flag an ERROR if matrix score sum deviates from 10.0', () => {
    const lessons = CurriculumService.getLessons(7, 'HK1').slice(0, 4);
    const template = localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade: 7,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template
    });

    // Intentionally corrupt matrix score
    matrix.totalScore = 9.5;

    const gateResult = QualityGate.validateChain({ matrix });
    expect(gateResult.passed).toBe(false);
    expect(gateResult.issues.some(i => i.code === 'ERR_MATRIX_SCORE_SUM')).toBe(true);
  });
});
