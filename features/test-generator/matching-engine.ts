import { QuestionItem } from '@/types/question';
import { SpecificationItem } from '@/types/specification';
import { QuestionService } from '@/features/question-bank/question-service';

export interface MatchingResult {
  specItem: SpecificationItem;
  matchedQuestions: QuestionItem[];
  missingCount: number;
  status: 'FULL' | 'PARTIAL' | 'EMPTY';
}

export interface MatchingOptions {
  forceAI?: boolean;
  shuffle?: boolean;
  aiRatio?: number; // e.g. 0.5 for 50% AI / 50% Bank, 1 for 100% AI, 0 for 100% Bank
  maxBankQuestions?: number;
}

export class QuestionMatchingEngine {
  /**
   * Matches questions strictly based on curriculum constraints
   * (lessonId, cognitiveLevel, questionType)
   */
  public static matchSpecItem(
    item: SpecificationItem,
    allQuestions?: QuestionItem[],
    options?: MatchingOptions
  ): MatchingResult {
    if (options?.forceAI || options?.maxBankQuestions === 0) {
      return {
        specItem: item,
        matchedQuestions: [],
        missingCount: item.questionCount,
        status: 'EMPTY'
      };
    }

    const questions = allQuestions || QuestionService.getQuestions();

    // Exact matching
    const exactMatches = questions.filter(q =>
      q.lessonId === item.lessonId &&
      q.cognitiveLevel === item.cognitiveLevel &&
      q.questionType === item.questionType
    );

    // Fallback: match by subjectArea, contentDomain and cognitive level if lessonId is slightly mismatched
    let candidateMatches = [...exactMatches];
    if (candidateMatches.length < item.questionCount) {
      const topicMatches = questions.filter(q =>
        !candidateMatches.some(m => m.id === q.id) &&
        q.cognitiveLevel === item.cognitiveLevel &&
        q.questionType === item.questionType &&
        (q.topic.toLowerCase().includes(item.topic.toLowerCase()) || item.topic.toLowerCase().includes(q.topic.toLowerCase()))
      );
      candidateMatches.push(...topicMatches);
    }

    // Shuffle candidate matches to ensure rich variety across tests
    const candidates = options?.shuffle !== false
      ? [...candidateMatches].sort(() => Math.random() - 0.5)
      : candidateMatches;

    const maxToTake = options?.maxBankQuestions !== undefined
      ? Math.min(item.questionCount, Math.max(0, options.maxBankQuestions))
      : item.questionCount;

    const matched = candidates.slice(0, maxToTake);
    const missing = Math.max(0, item.questionCount - matched.length);

    let status: 'FULL' | 'PARTIAL' | 'EMPTY' = 'FULL';
    if (matched.length === 0) status = 'EMPTY';
    else if (missing > 0) status = 'PARTIAL';

    return {
      specItem: item,
      matchedQuestions: matched,
      missingCount: missing,
      status
    };
  }

  /**
   * Matches all specification items for a test with optional 50/50 AI ratio
   */
  public static matchAll(
    specItems: SpecificationItem[],
    options?: MatchingOptions
  ): {
    results: MatchingResult[];
    isComplete: boolean;
    totalMissing: number;
  } {
    const allQuestions = QuestionService.getQuestions();

    if (options?.forceAI) {
      let totalMissing = 0;
      const results = specItems.map(item => {
        totalMissing += item.questionCount;
        return {
          specItem: item,
          matchedQuestions: [],
          missingCount: item.questionCount,
          status: 'EMPTY' as const
        };
      });
      return { results, isComplete: totalMissing === 0, totalMissing };
    }

    // If aiRatio is specified (e.g. 0.5 for 50% Bank / 50% AI), allocate Bank quota evenly across items
    const itemBankQuota = new Map<string, number>();
    if (options?.aiRatio !== undefined && options.aiRatio > 0 && options.aiRatio < 1) {
      const totalExamQuestions = specItems.reduce((sum, it) => sum + it.questionCount, 0);
      const targetTotalBank = Math.round(totalExamQuestions * (1 - options.aiRatio));

      const questionTypes = ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'] as const;
      const typeTargets: Record<string, number> = {};
      let sumTypeTargets = 0;

      questionTypes.forEach(t => {
        const typeItems = specItems.filter(it => it.questionType === t);
        const typeTotal = typeItems.reduce((sum, it) => sum + it.questionCount, 0);
        const typeBankTarget = Math.round(typeTotal * (1 - options.aiRatio!));
        typeTargets[t] = typeBankTarget;
        sumTypeTargets += typeBankTarget;
      });

      // Balance rounding differences to match exact targetTotalBank
      const diff = targetTotalBank - sumTypeTargets;
      if (diff !== 0 && typeTargets['MCQ'] !== undefined) {
        typeTargets['MCQ'] = Math.max(0, typeTargets['MCQ'] + diff);
      }

      // Distribute quota within each question type
      questionTypes.forEach(t => {
        const typeItems = specItems.filter(it => it.questionType === t);
        const typeTotal = typeItems.reduce((sum, it) => sum + it.questionCount, 0);
        const typeTarget = typeTargets[t] || 0;
        let allocated = 0;
        let slotIndex = 0;

        typeItems.forEach(item => {
          let itemBankCount = 0;
          for (let s = 0; s < item.questionCount; s++) {
            slotIndex++;
            const idealTargetSoFar = Math.round((slotIndex * typeTarget) / (typeTotal || 1));
            if (idealTargetSoFar > allocated && allocated < typeTarget) {
              itemBankCount++;
              allocated++;
            }
          }
          itemBankQuota.set(item.id, itemBankCount);
        });
      });
    }

    let totalMissing = 0;
    const results = specItems.map(item => {
      const itemMaxBank = itemBankQuota.get(item.id);
      const itemOptions: MatchingOptions = {
        ...options,
        maxBankQuestions: itemMaxBank !== undefined ? itemMaxBank : options?.maxBankQuestions
      };
      const res = this.matchSpecItem(item, allQuestions, itemOptions);
      totalMissing += res.missingCount;
      return res;
    });

    return {
      results,
      isComplete: totalMissing === 0,
      totalMissing
    };
  }
}
