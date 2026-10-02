import { ContextTrace } from '@/types/context';
import { QuestionItem } from '@/types/question';

export class TraceService {
  private static traces: Map<string, ContextTrace> = new Map();

  public static registerTrace(trace: ContextTrace): void {
    this.traces.set(trace.questionId, trace);
  }

  public static getTraceByQuestionId(questionId: string): ContextTrace | undefined {
    return this.traces.get(questionId);
  }

  /**
   * Build complete trace from question and its metadata
   */
  public static buildTraceForQuestion(
    question: QuestionItem,
    matrixCellId: string = 'CELL_DEFAULT',
    specificationId: string = 'SPEC_DEFAULT',
    testId?: string
  ): ContextTrace {
    const meta = question.contextMetadata;
    const sourceRefs: string[] = [];
    if (meta?.sourceTitle) sourceRefs.push(meta.sourceTitle);
    if (meta?.sourceUrl) sourceRefs.push(meta.sourceUrl);
    if (meta?.sourceOrganization) sourceRefs.push(meta.sourceOrganization);

    const trace: ContextTrace = {
      questionId: question.id,
      stimulusId: meta?.stimulus ? `STIM_${question.id}` : undefined,
      contextId: meta?.contextId || `CTX_${question.id}`,
      phenomenonId: meta?.phenomenon ? `PHENOM_${question.id}` : undefined,
      sourceRefs,
      learningRequirementId: question.learningRequirementId || question.learningRequirementText.substring(0, 30),
      specificationId,
      matrixCellId,
      testId
    };

    this.registerTrace(trace);
    return trace;
  }

  /**
   * Verify completeness of traceability chain (Section 22 & AT10)
   */
  public static verifyTraceChain(trace: ContextTrace): { isComplete: boolean; missingLinks: string[] } {
    const missingLinks: string[] = [];
    if (!trace.questionId) missingLinks.push('Thiếu Question ID');
    if (!trace.contextId) missingLinks.push('Thiếu Context ID');
    if (!trace.learningRequirementId) missingLinks.push('Thiếu Learning Requirement ID');
    if (!trace.specificationId) missingLinks.push('Thiếu Specification ID');
    if (!trace.matrixCellId) missingLinks.push('Thiếu Matrix Cell ID');
    if (!trace.sourceRefs || trace.sourceRefs.length === 0) missingLinks.push('Thiếu trích dẫn nguồn tài liệu');

    return {
      isComplete: missingLinks.length === 0,
      missingLinks
    };
  }
}
