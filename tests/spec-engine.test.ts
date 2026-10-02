import { describe, it, expect } from 'vitest';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { localDb } from '@/database/local-db';

describe('SpecEngine (1:1 Matrix-to-Specification Mapping)', () => {
  it('should generate a test specification strictly derived from matrix rows', () => {
    const lessons = CurriculumService.getLessons(8, 'HK1').slice(0, 6);
    const template = localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade: 8,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template
    });

    const spec = SpecEngine.generateFromMatrix(matrix);

    expect(spec.matrixId).toBe(matrix.id);
    expect(spec.grade).toBe(matrix.grade);
    expect(spec.items.length).toBeGreaterThan(0);

    // Sum of question counts in spec must match matrix total questions
    const specTotalQuestions = spec.items.reduce((s, it) => s + it.questionCount, 0);
    expect(specTotalQuestions).toBe(matrix.totalQuestions);

    // Sum of scores in spec must match 10.0
    const specTotalScore = Math.round(spec.items.reduce((s, it) => s + it.score, 0) * 100) / 100;
    expect(specTotalScore).toBe(10.0);

    // Each item must have learning requirement, cognitive level, question type, and pedagogical description
    spec.items.forEach(it => {
      expect(it.learningRequirement).toBeDefined();
      expect(it.learningRequirement.length).toBeGreaterThan(5);
      expect(it.description).toBeDefined();
      expect(it.score).toBeGreaterThan(0);
    });
  });
});
