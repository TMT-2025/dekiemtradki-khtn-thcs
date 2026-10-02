import { describe, it, expect } from 'vitest';
import { ContextService } from '@/features/context-engine/context-service';

describe('Context-First Generation (Workflow B & AT07)', () => {
  const phenomena = ContextService.getPhenomena();

  it('AT07: should generate full question family (5 items) from single phenomenon stimulus', () => {
    const phenom = phenomena.find(p => p.stimulus?.type === 'EXPERIMENT') || phenomena[0];
    expect(phenom).toBeDefined();

    const family = ContextService.generateQuestionFamilyFromPhenomenon(phenom);

    expect(family.length).toBe(5);

    // Q1: MCQ M1
    expect(family[0].questionType).toBe('MCQ');
    expect(family[0].cognitiveLevel).toBe('M1');
    expect(family[0].contextMetadata?.stimulus).toBeDefined();
    expect(family[0].contextMetadata?.trace).toBeDefined();

    // Q2: MCQ M2
    expect(family[1].questionType).toBe('MCQ');
    expect(family[1].cognitiveLevel).toBe('M2');

    // Q3: TRUE_FALSE M2
    expect(family[2].questionType).toBe('TRUE_FALSE');
    expect(family[2].options?.length).toBe(4);
    expect(family[2].options?.some(o => o.isCorrect === true)).toBe(true);

    // Q4: SHORT_ANSWER M3
    expect(family[3].questionType).toBe('SHORT_ANSWER');
    expect(family[3].cognitiveLevel).toBe('M3');
    expect(family[3].correctAnswer).toBeDefined();

    // Q5: ESSAY M4
    expect(family[4].questionType).toBe('ESSAY');
    expect(family[4].cognitiveLevel).toBe('M4');
    expect(family[4].explanation).toBeDefined();
  });

  it('should support customized generation for specific cognitive level and question type', () => {
    const phenom = phenomena.find(p => p.grade === 8) || phenomena[0];
    const question = ContextService.buildQuestionFromPhenomenon(
      phenom,
      'M3',
      'SHORT_ANSWER',
      'Phân tích được số liệu'
    );

    expect(question.grade).toBe(phenom.grade);
    expect(question.cognitiveLevel).toBe('M3');
    expect(question.questionType).toBe('SHORT_ANSWER');
    expect(question.contextMetadata?.hasContext).toBe(true);
    expect(question.contextMetadata?.phenomenon).toBe(phenom.title);
    expect(question.contextMetadata?.sourceTitle).toBe(phenom.source);
  });
});
