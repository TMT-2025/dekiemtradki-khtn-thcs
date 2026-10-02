import { describe, it, expect } from 'vitest';
import { ContextService } from '@/features/context-engine/context-service';
import { DiversityService } from '@/features/context-engine/diversity-service';
import { QuestionItem } from '@/types/question';

describe('Context Report & Diversity Engine (Section 21, 30 & AT06)', () => {
  const phenomena = ContextService.getPhenomena();

  it('AT06: should accurately calculate actual percentage, target percentage, and breakdown distributions', () => {
    const questions: QuestionItem[] = [
      ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M1', 'MCQ', 'YCCĐ 1'),
      ContextService.buildQuestionFromPhenomenon(phenomena[1], 'M2', 'TRUE_FALSE', 'YCCĐ 2'),
      ContextService.buildQuestionFromPhenomenon(phenomena[2], 'M3', 'SHORT_ANSWER', 'YCCĐ 3'),
      ContextService.buildQuestionFromPhenomenon(phenomena[3], 'M4', 'ESSAY', 'YCCĐ 4'),
      {
        id: 'Q_THEORY_1',
        grade: 6,
        semester: 'HK1',
        lessonId: 'L1',
        topic: 'Lý thuyết',
        subjectArea: 'PHYSICS',
        contentDomain: 'ENERGY',
        learningRequirementText: 'YCCĐ lý thuyết',
        cognitiveLevel: 'M1',
        questionType: 'MCQ',
        difficulty: 'EASY',
        questionText: 'Nhiệt độ nóng chảy của nước đá ở áp suất chuẩn là bao nhiêu?',
        correctAnswer: '0°C',
        score: 0.25,
        sourceLevel: 'TEXTBOOK',
        createdAt: '',
        updatedAt: ''
      }
    ];

    const report = ContextService.generateContextReport(questions, 0.8);

    expect(report.totalQuestions).toBe(5);
    expect(report.contextQuestions).toBe(4);
    expect(report.nonContextQuestions).toBe(1);
    expect(report.contextPercentage).toBe(80);
    expect(report.targetContextPercentage).toBe(80);
    expect(report.qualityStatus).toBe('PASS');

    // Cognitive level distribution
    expect(report.breakdownByLevel.M1).toBe(1);
    expect(report.breakdownByLevel.M2).toBe(1);
    expect(report.breakdownByLevel.M3).toBe(1);
    expect(report.breakdownByLevel.M4).toBe(1);

    // Cross-analysis
    expect(report.crossAnalysis).toBeDefined();
    expect(report.crossAnalysis?.questionTypeByContext.MCQ.context).toBe(1);
    expect(report.crossAnalysis?.questionTypeByContext.MCQ.nonContext).toBe(1);
    expect(report.crossAnalysis?.questionTypeByContext.TRUE_FALSE.context).toBe(1);
  });

  it('Section 30: should detect repeated phenomena when occurring more than 3 times', () => {
    const repeatedQuestions: QuestionItem[] = [
      ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M1', 'MCQ', 'YCCĐ 1'),
      ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M2', 'MCQ', 'YCCĐ 1'),
      ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M2', 'TRUE_FALSE', 'YCCĐ 1'),
      ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M3', 'SHORT_ANSWER', 'YCCĐ 1')
    ];

    const div = DiversityService.calculateDiversity(repeatedQuestions);
    expect(div.repeatedPhenomena.length).toBeGreaterThan(0);
    expect(div.diversityWarnings.some(w => w.includes('Hiện tượng bị lặp lại'))).toBe(true);
  });

  it('Section 30: should flag warning if 6+ context questions are restricted to fewer than 2 domains', () => {
    // 6 questions all in WATER domain
    const narrowQuestions: QuestionItem[] = Array.from({ length: 6 }).map((_, i) => {
      const q = ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M2', 'MCQ', `YCCĐ ${i}`);
      q.id = `Q_NARROW_${i}`;
      q.contextMetadata = {
        ...q.contextMetadata!,
        phenomenon: `Khía cạnh ${i}`,
        applicationArea: 'WATER'
      };
      return q;
    });

    const div = DiversityService.calculateDiversity(narrowQuestions);
    expect(div.diversityWarnings.some(w => w.includes('quá ít lĩnh vực'))).toBe(true);
  });
});
