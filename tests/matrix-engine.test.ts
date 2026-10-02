import { describe, it, expect } from 'vitest';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { localDb } from '@/database/local-db';

describe('MatrixEngine (16-Step Deterministic Calculation)', () => {
  it('should generate a valid matrix matching template structure and score 10.0', () => {
    // Select first 8 lessons of KHTN 6 HK1
    const lessons = CurriculumService.getLessons(6, 'HK1').slice(0, 8);
    expect(lessons.length).toBeGreaterThan(0);

    const template = localDb.getTemplates()[0]; // CV 984 Template
    expect(template).toBeDefined();

    const matrix = MatrixEngine.generateMatrix({
      grade: 6,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template,
      enableM4: true
    });

    // STEP 11: Kiểm tra tổng điểm = 10.0
    expect(matrix.totalScore).toBe(10.0);

    // STEP 12: Kiểm tra tổng tỷ lệ = 100%
    expect(matrix.totalPercentage).toBe(100.0);

    // STEP 13: Kiểm tra số câu từng dạng thức khớp đúng template
    // Template CV 984 có 14 MCQ, 2 TF, 3 SA, 3 Essay = 22 câu
    expect(matrix.summaryByQuestionType.MCQ.count).toBe(14);
    expect(matrix.summaryByQuestionType.TRUE_FALSE.count).toBe(2);
    expect(matrix.summaryByQuestionType.SHORT_ANSWER.count).toBe(3);
    expect(matrix.summaryByQuestionType.ESSAY.count).toBe(3);
    expect(matrix.totalQuestions).toBe(22);

    // STEP 16: Cơ chế Explain Why có mặt trong từng dòng
    expect(matrix.rows.length).toBe(lessons.length);
    matrix.rows.forEach(r => {
      expect(r.explainNotes).toBeDefined();
      expect(r.explainNotes?.['NB']).toBeDefined();
      expect(r.explainNotes?.['NB']?.sourceDocument).toContain('SGK KHTN 6');
    });
  });

  it('should re-calculate properly when teacher manually edits cell values', () => {
    const lessons = CurriculumService.getLessons(7, 'HK1').slice(0, 6);
    const template = localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade: 7,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template
    });

    // Teacher modifies row 0
    matrix.rows[0].nbMcq = 5;
    const updated = MatrixEngine.recalculateMatrix(matrix);

    expect(updated.totalScore).toBe(10.0);
    expect(updated.totalPercentage).toBe(100.0);
  });
});
