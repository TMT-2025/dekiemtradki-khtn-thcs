import { QuestionItem } from '@/types/question';
import { SpecificationItem } from '@/types/specification';
import { QuestionService } from '@/features/question-bank/question-service';

export interface MatchingResult {
  specItem: SpecificationItem;
  matchedQuestions: QuestionItem[];
  missingCount: number;
  status: 'FULL' | 'PARTIAL' | 'EMPTY';
}

export class QuestionMatchingEngine {
  /**
   * Matches questions strictly based on curriculum constraints
   * (lessonId, cognitiveLevel, questionType)
   */
  public static matchSpecItem(item: SpecificationItem, allQuestions?: QuestionItem[]): MatchingResult {
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

    const matched = candidateMatches.slice(0, item.questionCount);
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
   * Matches all specification items for a test
   */
  public static matchAll(specItems: SpecificationItem[]): {
    results: MatchingResult[];
    isComplete: boolean;
    totalMissing: number;
  } {
    const allQuestions = QuestionService.getQuestions();
    let totalMissing = 0;

    const results = specItems.map(item => {
      const res = this.matchSpecItem(item, allQuestions);
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
