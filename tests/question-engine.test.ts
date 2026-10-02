import { describe, it, expect } from 'vitest';
import { QuestionQualityEngine } from '@/features/question-bank/quality-engine';
import { QuestionService } from '@/features/question-bank/question-service';
import { QuestionItem } from '@/types/question';
import { localDb } from '@/database/local-db';

describe('QuestionQualityEngine & QuestionService', () => {
  it('should pass validation for a well-formed MCQ question', () => {
    const q: Partial<QuestionItem> = {
      questionText: 'Đơn vị cấu tạo cơ bản của mọi cơ thể sinh vật là gì?',
      questionType: 'MCQ',
      options: [
        { key: 'A', text: 'Mô' },
        { key: 'B', text: 'Tế bào' },
        { key: 'C', text: 'Cơ quan' },
        { key: 'D', text: 'Hệ cơ quan' }
      ],
      correctAnswer: 'B',
      explanation: 'Tất cả sinh vật sống đều cấu tạo từ tế bào.',
      rationale: 'Học sinh nhận biết khái niệm tế bào theo chuẩn GDPT 2018.',
      score: 0.25
    };

    const result = QuestionQualityEngine.evaluateQuestion(q);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.errors.length).toBe(0);
  });

  it('should detect errors when MCQ lacks 4 options or has an invalid answer key', () => {
    const q: Partial<QuestionItem> = {
      questionText: 'Khối lượng riêng là gì?',
      questionType: 'MCQ',
      options: [
        { key: 'A', text: 'Khối lượng của một đơn vị thể tích' },
        { key: 'B', text: 'Thể tích của một đơn vị khối lượng' }
      ],
      correctAnswer: 'Z', // Invalid answer key
      score: 0.25
    };

    const result = QuestionQualityEngine.evaluateQuestion(q);
    expect(result.passed).toBe(false);
    expect(result.errors.some(e => e.includes('đúng 4 phương án'))).toBe(true);
    expect(result.errors.some(e => e.includes('không hợp lệ'))).toBe(true);
  });

  it('should detect duplicate questions accurately', () => {
    const sampleQ: QuestionItem = {
      id: 'Q_DUP_TEST_01',
      grade: 6,
      semester: 'HK1',
      lessonId: 'LESSON_BIO_01',
      topic: 'Tế bào',
      subjectArea: 'BIOLOGY',
      contentDomain: 'LIVING_THINGS',
      learningRequirementText: 'Nêu được khái niệm tế bào',
      cognitiveLevel: 'M1',
      questionType: 'MCQ',
      difficulty: 'EASY',
      questionText: 'Đơn vị cấu tạo cơ bản của mọi cơ thể sinh vật là gì?',
      correctAnswer: 'B',
      explanation: 'Tất cả sinh vật đều cấu tạo từ tế bào',
      rationale: 'Nhận biết',
      score: 0.25,
      sourceLevel: 'TEXTBOOK',
      sourceCitation: { documentName: 'SGK KHTN 6', lessonName: 'Tế bào' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localDb.saveQuestion(sampleQ);

    const questions = QuestionService.getQuestions();
    expect(questions.length).toBeGreaterThan(0);

    const dupes = QuestionQualityEngine.findDuplicates(
      'Đơn vị cấu tạo cơ bản của mọi cơ thể sinh vật là gì?',
      questions
    );
    expect(dupes.length).toBeGreaterThan(0);
  });
});
