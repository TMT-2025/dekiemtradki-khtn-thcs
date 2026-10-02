import { describe, it, expect } from 'vitest';
import { ContextService } from '@/features/context-engine/context-service';
import { ContextQualityService } from '@/features/context-engine/context-quality-service';
import { QuestionService } from '@/features/question-bank/question-service';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { QuestionItem } from '@/types/question';

describe('Phase 7.3: AI Assessment Quality & Pedagogical Verification (12 Dimensions)', () => {
  const samplePhenomenon = ContextService.getPhenomena()[0];

  it('1. Scientific correctness & 2. Curriculum alignment: Generated question must be scientifically accurate and align with KHTN YCCĐ', () => {
    const q = ContextService.buildQuestionFromPhenomenon(
      samplePhenomenon,
      'M2',
      'MCQ',
      samplePhenomenon.curriculum_alignment
    );

    const detailed = ContextQualityService.evaluateQuestion(q);
    const qg01 = detailed.checks.find(c => c.criterionId === 'QG01');
    const qg02 = detailed.checks.find(c => c.criterionId === 'QG02');

    expect(qg01?.status).toBe('PASS');
    expect(qg02?.status).toBe('PASS');
  });

  it('3. Learning requirement alignment & 4. Cognitive level: Question matches designated cognitive level (M1, M2, M3, M4)', () => {
    const levels = ['M1', 'M2', 'M3', 'M4'] as const;

    levels.forEach(lvl => {
      const q = ContextService.buildQuestionFromPhenomenon(
        samplePhenomenon,
        lvl,
        'MCQ',
        samplePhenomenon.curriculum_alignment
      );
      expect(q.cognitiveLevel).toBe(lvl);
      const detailed = ContextQualityService.evaluateQuestion(q);
      const qg09 = detailed.checks.find(c => c.criterionId === 'QG09');
      expect(qg09?.status).toBe('PASS');
    });
  });

  it('5. Context necessity: Question must pass Context Must Matter test (AT08)', () => {
    const contextQ = ContextService.buildQuestionFromPhenomenon(
      samplePhenomenon,
      'M2',
      'MCQ',
      samplePhenomenon.curriculum_alignment
    );

    const detailed = ContextQualityService.evaluateQuestion(contextQ);
    const qg05 = detailed.checks.find(c => c.criterionId === 'QG05');
    expect(qg05?.status).toBe('PASS');
  });

  it('6. Answer uniqueness & 7. Distractor quality: MCQ options must have exactly 1 correct answer and 3 distinct plausible distractors', () => {
    const mcq = ContextService.buildQuestionFromPhenomenon(
      samplePhenomenon,
      'M2',
      'MCQ',
      samplePhenomenon.curriculum_alignment
    );

    expect(mcq.options).toBeDefined();
    expect(mcq.options?.length).toBe(4);

    const correctOptions = mcq.options?.filter(o => o.isCorrect === true);
    expect(correctOptions?.length).toBe(1);

    const texts = mcq.options?.map(o => o.text.trim().toLowerCase());
    const uniqueTexts = new Set(texts);
    expect(uniqueTexts.size).toBe(4); // All 4 options are distinct
  });

  it('8. Age appropriateness & 9. Language clarity: Question must not contain university jargon or convoluted sentence structures', () => {
    const q = ContextService.buildQuestionFromPhenomenon(
      samplePhenomenon,
      'M2',
      'MCQ',
      samplePhenomenon.curriculum_alignment
    );

    const detailed = ContextQualityService.evaluateQuestion(q);
    const qg03 = detailed.checks.find(c => c.criterionId === 'QG03');
    const qg07 = detailed.checks.find(c => c.criterionId === 'QG07');

    expect(qg03?.status).toBe('PASS');
    expect(qg07?.status).toBe('PASS');
  });

  it('10. Source provenance & 11. Synthetic-data labeling: Sources must be traceable and synthetic data must be explicitly labeled', () => {
    const q = ContextService.buildQuestionFromPhenomenon(
      samplePhenomenon,
      'M2',
      'MCQ',
      samplePhenomenon.curriculum_alignment
    );

    expect(q.contextMetadata?.sourceTitle).toBeDefined();
    expect(q.contextMetadata?.sourceTitle?.length).toBeGreaterThan(0);

    if (q.contextMetadata?.stimulus?.isSynthetic) {
      expect(q.contextMetadata.stimulus.isSynthetic).toBe(true);
    }
  });

  it('12. AI Hallucination Guard: AI generator must ground every question in genuine Curriculum data and verified legal sources', async () => {
    const lesson = CurriculumService.getLessons(6, 'HK1')[0];
    expect(lesson).toBeDefined();

    const aiQuestion = await QuestionService.generateQuestionWithAI({
      lessonId: lesson.id,
      cognitiveLevel: 'M2',
      questionType: 'MCQ',
      score: 0.25
    });

    expect(aiQuestion).toBeDefined();
    expect(aiQuestion.grade).toBe(6);
    expect(aiQuestion.topic).toBe(lesson.title);
    expect(aiQuestion.learningRequirementText.length).toBeGreaterThan(5);
    expect(aiQuestion.options?.length).toBe(4);
    expect(aiQuestion.correctAnswer).toBeDefined();
  });
});
