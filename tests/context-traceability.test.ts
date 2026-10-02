import { describe, it, expect } from 'vitest';
import { TraceService } from '@/features/context-engine/trace-service';
import { ContextService } from '@/features/context-engine/context-service';
import { QuestionItem } from '@/types/question';

describe('Context Traceability & Provenance (Section 22 & AT10)', () => {
  const samplePhenomenon = ContextService.getPhenomena()[0];

  it('AT10: should verify full provenance for international/adapted sources', () => {
    const intlList = ContextService.getInternationalContexts();
    expect(intlList.length).toBeGreaterThanOrEqual(5);

    intlList.forEach(item => {
      expect(item.organization).toBeDefined();
      expect(item.organization.length).toBeGreaterThan(0);
      expect(item.license).toBeDefined();
      expect(item.source_url).toMatch(/^https?:\/\//);
      expect(item.curriculum_alignment).toBeDefined();
    });
  });

  it('should build complete trace chain for context-based question', () => {
    const question = ContextService.buildQuestionFromPhenomenon(
      samplePhenomenon,
      'M2',
      'MCQ',
      'Nêu được khái niệm dung dịch'
    );

    const trace = TraceService.buildTraceForQuestion(
      question,
      'CELL_G6_CHEM_M2',
      'SPEC_G6_MID1_001',
      'TEST_2026_G6_MID1'
    );

    expect(trace).toBeDefined();
    expect(trace.questionId).toBe(question.id);
    expect(trace.contextId).toBe(samplePhenomenon.phenomenon_id);
    expect(trace.matrixCellId).toBe('CELL_G6_CHEM_M2');
    expect(trace.specificationId).toBe('SPEC_G6_MID1_001');
    expect(trace.testId).toBe('TEST_2026_G6_MID1');
    expect(trace.sourceRefs.length).toBeGreaterThan(0);

    const check = TraceService.verifyTraceChain(trace);
    expect(check.isComplete).toBe(true);
    expect(check.missingLinks.length).toBe(0);
  });

  it('should detect missing links in an incomplete trace chain', () => {
    const brokenTrace = {
      questionId: 'Q_BROKEN_01',
      contextId: '', // Missing
      sourceRefs: [], // Missing
      learningRequirementId: '',
      matrixCellId: 'CELL_1',
      specificationId: 'SPEC_1'
    };

    const check = TraceService.verifyTraceChain(brokenTrace as any);
    expect(check.isComplete).toBe(false);
    expect(check.missingLinks.length).toBeGreaterThan(0);
    expect(check.missingLinks.some(m => m.includes('Context ID'))).toBe(true);
    expect(check.missingLinks.some(m => m.includes('nguồn tài liệu'))).toBe(true);
  });
});
