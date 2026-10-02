import { describe, it, expect } from 'vitest';
import { ContextService } from '../features/context-engine/context-service';
import { QuestionItem } from '../types/question';

describe('Context-Based Science Assessment Engine', () => {
  it('should load and filter authentic phenomena across KHTN 6, 7, 8, 9', () => {
    const allPhenomena = ContextService.getPhenomena();
    expect(allPhenomena.length).toBeGreaterThanOrEqual(10);

    // Filter Grade 6
    const g6 = ContextService.filterPhenomena({ grade: 6 });
    expect(g6.length).toBeGreaterThan(0);
    expect(g6.every(p => p.grade === 6)).toBe(true);

    // Filter by Application Area
    const water = ContextService.filterPhenomena({ applicationArea: 'WATER' });
    expect(water.length).toBeGreaterThan(0);
    expect(water.every(p => p.application_area === 'WATER')).toBe(true);

    // Filter by Complexity Level C3 (Inquiry/Experiment)
    const c3 = ContextService.filterPhenomena({ contextLevel: 'C3' });
    expect(c3.length).toBeGreaterThan(0);
    expect(c3.every(p => p.context_level === 'C3')).toBe(true);
  });

  it('should load and verify international sources (NOAA, WHO, OECD PISA, EPA, IRRI)', () => {
    const intl = ContextService.getInternationalContexts();
    expect(intl.length).toBeGreaterThanOrEqual(5);

    const whoItem = intl.find(i => i.organization.includes('WHO'));
    expect(whoItem).toBeDefined();
    expect(whoItem?.adapted_context).toContain('bình lọc trường THCS');
    expect(whoItem?.license).toBeDefined();

    const noaaItem = intl.find(i => i.organization.includes('NOAA'));
    expect(noaaItem).toBeDefined();
    expect(noaaItem?.adapted_context).toContain('nước nở vì nhiệt');
  });

  describe('Context Quality Gate (10 Criteria)', () => {
    it('should PASS high quality context-based question', () => {
      const g8Phenom = ContextService.filterPhenomena({ grade: 8, applicationArea: 'HEALTH' })[0];
      const validQuestion = ContextService.buildQuestionFromPhenomenon(
        g8Phenom,
        'M2',
        'MCQ',
        'Trình bày được cấu tạo và chức năng của hệ tuần hoàn; giải thích được sự thay đổi nhịp tim khi vận động mạnh.'
      );

      const result = ContextService.validateContextQuality(validQuestion);
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(8);
      expect(result.ageAppropriateness).toBe(true);
      expect(result.culturalAppropriateness).toBe(true);
      expect(result.contextNecessity).toBe(true);
    });

    it('should FAIL age appropriateness if question contains university-level jargon', () => {
      const g6Phenom = ContextService.filterPhenomena({ grade: 6 })[0];
      const badQuestion = ContextService.buildQuestionFromPhenomenon(
        g6Phenom,
        'M2',
        'MCQ',
        'Nêu được khái niệm dung dịch'
      );
      badQuestion.questionText += ' Hãy tính hàm thế nhiệt động năng lượng Gibbs và entropi của hệ.';

      const result = ContextService.validateContextQuality(badQuestion);
      expect(result.passed).toBe(false);
      expect(result.ageAppropriateness).toBe(false);
      expect(result.issues.some(i => i.includes('thuật ngữ vượt trình độ THCS'))).toBe(true);
    });

    it('should FAIL cultural appropriateness if question uses non-metric units', () => {
      const g7Phenom = ContextService.filterPhenomena({ grade: 7 })[0];
      const badQuestion = ContextService.buildQuestionFromPhenomenon(
        g7Phenom,
        'M3',
        'MCQ',
        'Vận dụng tính áp suất'
      );
      badQuestion.questionText += ' Nước sôi ở 212 fahrenheit khi áp suất tăng.';

      const result = ContextService.validateContextQuality(badQuestion);
      expect(result.passed).toBe(false);
      expect(result.culturalAppropriateness).toBe(false);
      expect(result.issues.some(i => i.includes('đơn vị đo không chuẩn hóa'))).toBe(true);
    });
  });

  describe('Context Report & Diversity', () => {
    it('should correctly calculate context statistics and distribution', () => {
      const phenomena = ContextService.getPhenomena();
      const mockQuestions: QuestionItem[] = [
        ContextService.buildQuestionFromPhenomenon(phenomena[0], 'M1', 'MCQ', 'YCCĐ 1'),
        ContextService.buildQuestionFromPhenomenon(phenomena[1], 'M2', 'TRUE_FALSE', 'YCCĐ 2'),
        ContextService.buildQuestionFromPhenomenon(phenomena[2], 'M3', 'SHORT_ANSWER', 'YCCĐ 3'),
        {
          id: 'Q_NON_CTX_1',
          grade: 6,
          semester: 'HK1',
          lessonId: 'L1',
          topic: 'Lý thuyết thuần',
          subjectArea: 'PHYSICS',
          contentDomain: 'ENERGY_CHANGE',
          learningRequirementText: 'YCCĐ thuần túy',
          cognitiveLevel: 'M1',
          questionType: 'MCQ',
          difficulty: 'EASY',
          questionText: 'Đơn vị đo độ dài trong hệ SI là gì?',
          correctAnswer: 'Mét (m)',
          explanation: 'Lý thuyết SGK',
          rationale: 'M1',
          score: 0.25,
          sourceLevel: 'TEXTBOOK',
          sourceCitation: { documentName: 'SGK KHTN 6', lessonName: 'Bài 1' },
          createdAt: '',
          updatedAt: ''
        }
      ];

      const report = ContextService.generateContextReport(mockQuestions, 0.75);
      expect(report.totalQuestions).toBe(4);
      expect(report.contextQuestions).toBe(3);
      expect(report.nonContextQuestions).toBe(1);
      expect(report.contextPercentage).toBe(75);
      expect(report.targetContextPercentage).toBe(75);
      expect(report.qualityStatus).toBe('PASS');
      expect(report.breakdownByLevel.M1).toBe(1);
      expect(report.breakdownByLevel.M2).toBe(1);
      expect(report.breakdownByLevel.M3).toBe(1);
    });
  });

  describe('Workflow B: Context-First Generation', () => {
    it('should generate well-structured questions across all 4 types (MCQ, True/False, Short Answer, Essay)', () => {
      const phenom = ContextService.filterPhenomena({ grade: 7, applicationArea: 'SCIENTIFIC_RESEARCH' })[0];
      expect(phenom).toBeDefined();

      const mcq = ContextService.buildQuestionFromPhenomenon(phenom, 'M2', 'MCQ', 'Quang hợp');
      expect(mcq.questionType).toBe('MCQ');
      expect(mcq.options?.length).toBe(4);
      expect(mcq.contextMetadata?.hasContext).toBe(true);

      const tf = ContextService.buildQuestionFromPhenomenon(phenom, 'M3', 'TRUE_FALSE', 'Quang hợp');
      expect(tf.questionType).toBe('TRUE_FALSE');
      expect(tf.options?.length).toBe(4);
      expect(tf.options?.[0].isCorrect).toBeDefined();

      const sa = ContextService.buildQuestionFromPhenomenon(phenom, 'M3', 'SHORT_ANSWER', 'Quang hợp');
      expect(sa.questionType).toBe('SHORT_ANSWER');
      expect(sa.correctAnswer).toBeDefined();

      const essay = ContextService.buildQuestionFromPhenomenon(phenom, 'M4', 'ESSAY', 'Quang hợp');
      expect(essay.questionType).toBe('ESSAY');
      expect(essay.questionText).toContain('biến độc lập');
    });
  });
});
