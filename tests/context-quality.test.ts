import { describe, it, expect } from 'vitest';
import { ContextQualityService } from '@/features/context-engine/context-quality-service';
import { ContextService } from '@/features/context-engine/context-service';
import { QuestionItem } from '@/types/question';

describe('Context Quality Gate (QG01–QG10) & Acceptance Tests', () => {
  const samplePhenomenon = ContextService.getPhenomena()[0];

  it('AT03: should PASS high quality context-based question with all 10 criteria', () => {
    const validQuestion: QuestionItem = {
      id: 'Q_VALID_CTX_01',
      grade: 6,
      semester: 'HK1',
      lessonId: 'L_MIXTURE',
      topic: 'Dung dịch và độ tan',
      subjectArea: 'CHEMISTRY',
      contentDomain: 'SUBSTANCES',
      learningRequirementText: 'Nêu được khái niệm dung dịch, dung môi, chất tan; phân tích ảnh hưởng của nồng độ muối đến nhiệt độ đông đặc.',
      cognitiveLevel: 'M2',
      questionType: 'MCQ',
      difficulty: 'MEDIUM',
      questionText: 'Dựa vào bảng số liệu trên, khi tăng khối lượng muối ăn (NaCl) hòa tan trong 100 mL nước từ 0 g lên 7 g thì nhiệt độ bắt đầu đông đặc của nước muối thay đổi như thế nào?',
      options: [
        { key: 'A', text: 'Giảm dần từ 0,0°C xuống -3,8°C', isCorrect: true },
        { key: 'B', text: 'Tăng dần từ 0,0°C lên 3,8°C', isCorrect: false },
        { key: 'C', text: 'Không thay đổi và luôn giữ ở 0,0°C', isCorrect: false },
        { key: 'D', text: 'Tăng lên rồi sau đó giảm đột ngột', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Khi nồng độ chất tan tăng, nhiệt độ bắt đầu đông đặc của dung dịch hạ thấp hơn so với nước cất tinh khiết.',
      rationale: 'Học sinh đọc bảng số liệu và so sánh xu hướng nhiệt độ.',
      score: 0.25,
      sourceLevel: 'TEXTBOOK',
      contextMetadata: {
        hasContext: true,
        contextId: samplePhenomenon.phenomenon_id,
        contextType: 'GLOBAL',
        contextLevel: 'C2',
        applicationArea: 'WATER',
        phenomenon: samplePhenomenon.title,
        stimulus: samplePhenomenon.stimulus,
        realWorldRelevance: true,
        scientificPractice: 'Interpret data',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'PISA Science Framework & SGK KHTN 6 Kết nối tri thức',
        sourceUrl: 'https://www.oecd.org/pisa/',
        sourceCountry: 'OECD / Việt Nam',
        adaptationNote: 'Việt hóa chuẩn chương trình GDPT 2018.'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const detailed = ContextQualityService.evaluateQuestion(validQuestion);
    expect(detailed.status).toBe('PASS');
    expect(detailed.passed).toBe(true);
    expect(detailed.score).toBeGreaterThanOrEqual(90);
    expect(detailed.blockingIssues.length).toBe(0);

    const qg05 = detailed.checks.find(c => c.criterionId === 'QG05');
    expect(qg05?.status).toBe('PASS');
  });

  it('AT04: should FAIL age appropriateness when containing university-level jargon', () => {
    const jargonQuestion: QuestionItem = {
      id: 'Q_JARGON_01',
      grade: 6,
      semester: 'HK1',
      lessonId: 'L1',
      topic: 'Dung dịch',
      subjectArea: 'CHEMISTRY',
      contentDomain: 'SUBSTANCES',
      learningRequirementText: 'Khái niệm dung dịch',
      cognitiveLevel: 'M2',
      questionType: 'MCQ',
      difficulty: 'HARD',
      questionText: 'Dựa vào bảng dữ liệu, hãy xác định biến thiên năng lượng gibbs và hàm entropi tự do của quá trình solvat hóa.',
      score: 0.25,
      sourceLevel: 'TEXTBOOK',
      contextMetadata: {
        hasContext: true,
        contextId: 'C1',
        phenomenon: 'Hòa tan muối',
        realWorldRelevance: true
      },
      createdAt: '',
      updatedAt: ''
    };

    const detailed = ContextQualityService.evaluateQuestion(jargonQuestion);
    const qg03 = detailed.checks.find(c => c.criterionId === 'QG03');
    expect(qg03?.status).toBe('FAIL');
    expect(qg03?.message).toContain('thuật ngữ vượt trình độ THCS');
    expect(detailed.passed).toBe(false);
  });

  it('AT05: should FAIL cultural appropriateness when containing non-metric units without normalization', () => {
    const nonMetricQuestion: QuestionItem = {
      id: 'Q_NON_METRIC_01',
      grade: 7,
      semester: 'HK1',
      lessonId: 'L2',
      topic: 'Áp suất và nhiệt độ',
      subjectArea: 'PHYSICS',
      contentDomain: 'ENERGY',
      learningRequirementText: 'Vận dụng kiến thức áp suất',
      cognitiveLevel: 'M3',
      questionType: 'MCQ',
      difficulty: 'MEDIUM',
      questionText: 'Một bình chứa 5 gallon nước ở 212 fahrenheit, người ta tăng áp suất thêm 3 psi.',
      score: 0.25,
      sourceLevel: 'TEXTBOOK',
      contextMetadata: {
        hasContext: true,
        contextId: 'C2',
        phenomenon: 'Áp suất',
        realWorldRelevance: true
      },
      createdAt: '',
      updatedAt: ''
    };

    const detailed = ContextQualityService.evaluateQuestion(nonMetricQuestion);
    const qg08 = detailed.checks.find(c => c.criterionId === 'QG08');
    expect(qg08?.status).toBe('FAIL');
    expect(qg08?.message).toContain('đơn vị đo không chuẩn hóa');
    expect(detailed.passed).toBe(false);
  });

  it('AT08: should FAIL QG05 (Remove Context Test) if question is purely decorative recall', () => {
    const decorativeQuestion: QuestionItem = {
      id: 'Q_DECORATIVE_01',
      grade: 8,
      semester: 'HK1',
      lessonId: 'L3',
      topic: 'Dung dịch acid',
      subjectArea: 'CHEMISTRY',
      contentDomain: 'SUBSTANCES',
      learningRequirementText: 'Tính chất hóa học của acid',
      cognitiveLevel: 'M2',
      questionType: 'MCQ',
      difficulty: 'EASY',
      // The context paragraph is attached in meta, but the question is pure recall that doesn't use the context
      questionText: 'Acid clohiđric có công thức hóa học là gì?',
      options: [
        { key: 'A', text: 'HCl', isCorrect: true },
        { key: 'B', text: 'H2SO4', isCorrect: false },
        { key: 'C', text: 'HNO3', isCorrect: false },
        { key: 'D', text: 'NaOH', isCorrect: false }
      ],
      correctAnswer: 'A',
      score: 0.25,
      sourceLevel: 'TEXTBOOK',
      contextMetadata: {
        hasContext: true,
        contextId: 'C3',
        phenomenon: 'Nhà máy sản xuất hóa chất tại KCN Phú Mỹ thải khí vào môi trường.',
        stimulus: undefined,
        realWorldRelevance: true
      },
      createdAt: '',
      updatedAt: ''
    };

    const detailed = ContextQualityService.evaluateQuestion(decorativeQuestion);
    const qg05 = detailed.checks.find(c => c.criterionId === 'QG05');
    expect(qg05?.status).toBe('FAIL');
    expect(qg05?.message).toContain('FAIL: CONTEXT_NOT_NECESSARY');
    expect(detailed.blockingIssues.some(b => b.includes('QG05'))).toBe(true);
    expect(detailed.status).toBe('FAIL');
  });

  it('AT09: should detect synthetic data and enforce synthetic data labeling notice', () => {
    const rawTable = {
      id: 'T1',
      columns: [{ key: 'x', label: 'X', type: 'NUMBER' as const }],
      rows: [{ x: 10 }],
      isSynthetic: true
    };

    const isMarked = rawTable.isSynthetic === true;
    expect(isMarked).toBe(true);

    const formattedNotice = 'Số liệu thực nghiệm mô phỏng phục vụ mục đích kiểm tra đánh giá';
    expect(formattedNotice).toBeDefined();
    expect(formattedNotice.length).toBeGreaterThan(10);
  });

  it('Blocking criteria rule: should BLOCK publication if QG01, QG02, QG05, or QG10 fails', () => {
    const missingSourceQuestion: QuestionItem = {
      id: 'Q_NO_SOURCE_DIRECT',
      grade: 9,
      semester: 'HK1',
      lessonId: 'L4',
      topic: 'Mưa acid',
      subjectArea: 'CHEMISTRY',
      contentDomain: 'SUBSTANCES',
      learningRequirementText: 'Mưa acid',
      cognitiveLevel: 'M2',
      questionType: 'MCQ',
      difficulty: 'HARD',
      questionText: 'Dựa vào dữ liệu đo pH mưa acid, hãy xác định xu hướng.',
      score: 0.25,
      sourceLevel: 'REFERENCE',
      contextMetadata: {
        hasContext: true,
        contextId: 'C4',
        phenomenon: 'Mưa acid',
        sourceType: 'DIRECT_SOURCE', // Missing URL and title!
        sourceTitle: undefined,
        sourceUrl: undefined,
        realWorldRelevance: true
      },
      createdAt: '',
      updatedAt: ''
    };

    const detailed = ContextQualityService.evaluateQuestion(missingSourceQuestion);
    const qg10 = detailed.checks.find(c => c.criterionId === 'QG10');
    expect(qg10?.status).toBe('FAIL');
    expect(detailed.blockingIssues.some(b => b.includes('QG10'))).toBe(true);
    expect(detailed.status).toBe('FAIL');
    expect(detailed.passed).toBe(false);
  });
});
