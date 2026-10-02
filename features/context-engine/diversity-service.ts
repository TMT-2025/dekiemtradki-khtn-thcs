import { QuestionItem } from '@/types/question';
import { DiversityReport } from '@/types/context';

export class DiversityService {
  /**
   * Section 30: Calculate Diversity Report and Detect Repetition
   */
  public static calculateDiversity(questions: QuestionItem[]): DiversityReport {
    const scopeDistribution: Record<string, number> = {};
    const domainDistribution: Record<string, number> = {};
    const complexityDistribution: Record<string, number> = {};
    const stimulusDistribution: Record<string, number> = {};

    const phenomenonCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const diversityWarnings: string[] = [];

    questions.forEach(q => {
      if (q.contextMetadata?.hasContext) {
        const meta = q.contextMetadata;

        const scope = meta.contextType || 'PERSONAL';
        scopeDistribution[scope] = (scopeDistribution[scope] || 0) + 1;

        const domain = meta.applicationArea || 'DAILY_LIFE';
        domainDistribution[domain] = (domainDistribution[domain] || 0) + 1;

        const complexity = meta.contextLevel || 'C1';
        complexityDistribution[complexity] = (complexityDistribution[complexity] || 0) + 1;

        const stimType = meta.stimulus?.type || 'TEXT';
        stimulusDistribution[stimType] = (stimulusDistribution[stimType] || 0) + 1;

        if (meta.phenomenon) {
          phenomenonCounts[meta.phenomenon] = (phenomenonCounts[meta.phenomenon] || 0) + 1;
        }

        const src = meta.sourceTitle || meta.sourceOrganization;
        if (src) {
          sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        }
      }
    });

    // Detect repeated phenomena (more than 3 times in a single test)
    const repeatedPhenomena = Object.entries(phenomenonCounts)
      .filter(([_, count]) => count > 3)
      .map(([name, count]) => `${name} (${count} lần)`);

    if (repeatedPhenomena.length > 0) {
      diversityWarnings.push(`Hiện tượng bị lặp lại nhiều lần trong cùng đề thi: ${repeatedPhenomena.join(', ')}.`);
    }

    // Detect repeated sources (more than 4 times)
    const repeatedSources = Object.entries(sourceCounts)
      .filter(([_, count]) => count > 4)
      .map(([name, count]) => `${name} (${count} lần)`);

    if (repeatedSources.length > 0) {
      diversityWarnings.push(`Nguồn tài liệu bị khai thác lặp lại nhiều lần: ${repeatedSources.join(', ')}.`);
    }

    // Check if domain distribution is too narrow
    const activeDomains = Object.keys(domainDistribution).length;
    const contextCount = questions.filter(q => q.contextMetadata?.hasContext).length;
    if (contextCount >= 6 && activeDomains < 2) {
      diversityWarnings.push('Các câu hỏi bối cảnh đang dồn vào quá ít lĩnh vực. Nên mở rộng sang các lĩnh vực khác (Môi trường, Năng lượng, Sức khỏe).');
    }

    return {
      scopeDistribution,
      domainDistribution,
      complexityDistribution,
      stimulusDistribution,
      repeatedPhenomena,
      repeatedSources,
      diversityWarnings
    };
  }

  /**
   * Section 21: Cross-analysis calculations
   */
  public static calculateCrossAnalysis(questions: QuestionItem[]) {
    const scopeByCognitive: Record<string, Record<string, number>> = {};
    const domainByCognitive: Record<string, Record<string, number>> = {};
    const complexityByCognitive: Record<string, Record<string, number>> = {};
    const questionTypeByContext: Record<string, { context: number; nonContext: number }> = {
      MCQ: { context: 0, nonContext: 0 },
      TRUE_FALSE: { context: 0, nonContext: 0 },
      SHORT_ANSWER: { context: 0, nonContext: 0 },
      ESSAY: { context: 0, nonContext: 0 }
    };

    questions.forEach(q => {
      const cog = q.cognitiveLevel;
      const hasCtx = !!q.contextMetadata?.hasContext;
      const qType = q.questionType;

      if (!questionTypeByContext[qType]) {
        questionTypeByContext[qType] = { context: 0, nonContext: 0 };
      }
      if (hasCtx) {
        questionTypeByContext[qType].context++;

        const scope = q.contextMetadata?.contextType || 'PERSONAL';
        if (!scopeByCognitive[scope]) scopeByCognitive[scope] = {};
        scopeByCognitive[scope][cog] = (scopeByCognitive[scope][cog] || 0) + 1;

        const domain = q.contextMetadata?.applicationArea || 'DAILY_LIFE';
        if (!domainByCognitive[domain]) domainByCognitive[domain] = {};
        domainByCognitive[domain][cog] = (domainByCognitive[domain][cog] || 0) + 1;

        const comp = q.contextMetadata?.contextLevel || 'C1';
        if (!complexityByCognitive[comp]) complexityByCognitive[comp] = {};
        complexityByCognitive[comp][cog] = (complexityByCognitive[comp][cog] || 0) + 1;
      } else {
        questionTypeByContext[qType].nonContext++;
      }
    });

    return {
      scopeByCognitive,
      domainByCognitive,
      complexityByCognitive,
      questionTypeByContext
    };
  }
}
