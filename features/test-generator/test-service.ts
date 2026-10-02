import { localDb } from '@/database/local-db';
import { AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { TestExam, TestPart, TestPartQuestion, AnswerKeyItem, ScoringGuide, ScoringRubricItem } from '@/types/test';
import { QuestionItem } from '@/types/question';
import { QuestionMatchingEngine, MatchingResult } from './matching-engine';
import { QuestionService } from '@/features/question-bank/question-service';
import { ContextService } from '@/features/context-engine/context-service';

export interface GenerateTestInput {
  matrix: AssessmentMatrix;
  specification: TestSpecification;
  testCode?: string;
  title?: string;
  schoolName?: string;
  departmentName?: string;
  mode: 'AUTO' | 'MANUAL';
  manualQuestionSelections?: Record<string, string[]>; // specItemId -> questionIds
}

import { resolveExamPeriod } from '@/lib/exam-period';
export { resolveExamPeriod };

export class TestService {
  /**
   * Generates a complete test exam with Answer Key and Scoring Guide
   */
  public static async generateTest(input: GenerateTestInput): Promise<{
    test: TestExam;
    matchingResults: MatchingResult[];
    hasMissingQuestions: boolean;
  }> {
    const matching = QuestionMatchingEngine.matchAll(input.specification.items);
    
    // Auto-generate missing questions concurrently if in AUTO mode
    if (input.mode === 'AUTO' && !matching.isComplete) {
      const generationTasks: Promise<void>[] = [];
      for (const res of matching.results) {
        const countToGenerate = res.missingCount;
        for (let i = 0; i < countToGenerate; i++) {
          generationTasks.push((async () => {
            try {
              const generated = await QuestionService.generateQuestionWithAI({
                lessonId: res.specItem.lessonId,
                cognitiveLevel: res.specItem.cognitiveLevel,
                questionType: res.specItem.questionType,
                score: res.specItem.score / res.specItem.questionCount
              });
              res.matchedQuestions.push(generated);
              res.missingCount--;
            } catch (e) {
              console.warn('Could not auto-generate missing question:', e);
            }
          })());
        }
      }
      await Promise.all(generationTasks);
      for (const res of matching.results) {
        if (res.missingCount === 0) res.status = 'FULL';
        else if (res.matchedQuestions.length > 0) res.status = 'PARTIAL';
      }
    }

    // Organize questions into 4 standard parts:
    // Part I: MCQ (14 items = 3.5 pts)
    // Part II: True/False (2 items = 2.0 pts)
    // Part III: Short Answer (3 items = 1.5 pts)
    // Part IV: Essay (3 items = 3.0 pts)

    // Context Enrichment according to target ratio (Section XLVII & LXV)
    const targetRatio = input.matrix.contextRatio !== undefined ? input.matrix.contextRatio : 0.5;
    const allQuestions: QuestionItem[] = [];
    matching.results.forEach(res => {
      res.matchedQuestions.forEach(q => allQuestions.push(q));
    });

    const targetContextCount = Math.round(allQuestions.length * targetRatio);
    let currentContextCount = 0;

    for (const q of allQuestions) {
      if (currentContextCount < targetContextCount) {
        if (!q.contextMetadata?.hasContext || !q.contextMetadata?.stimulus?.leadParagraph) {
          q.contextMetadata = ContextService.generateRichContextForQuestion(q);
        }
        currentContextCount++;
      } else if (!q.contextMetadata?.stimulus?.leadParagraph) {
        q.contextMetadata = undefined;
      }
    }

    const contextReport = ContextService.generateContextReport(allQuestions, targetRatio);

    const mcqQuestions: TestPartQuestion[] = [];
    const tfQuestions: TestPartQuestion[] = [];
    const saQuestions: TestPartQuestion[] = [];
    const esQuestions: TestPartQuestion[] = [];

    // Collect all matched questions into separate parts first
    matching.results.forEach(res => {
      res.matchedQuestions.forEach(q => {
        const itemScore = res.specItem.score / res.specItem.questionCount;
        if (q.questionType === 'MCQ') {
          mcqQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore
          });
        } else if (q.questionType === 'TRUE_FALSE') {
          tfQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore
          });
        } else if (q.questionType === 'SHORT_ANSWER') {
          saQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore
          });
        } else {
          esQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore
          });
        }
      });
    });

    // Strictly assign sequential continuous numbering: Part I -> Part II -> Part III -> Part IV
    let runningOrder = 1;
    mcqQuestions.forEach((q, idx) => {
      q.orderInPart = idx + 1;
      q.globalOrderIndex = runningOrder++;
    });
    tfQuestions.forEach((q, idx) => {
      q.orderInPart = idx + 1;
      q.globalOrderIndex = runningOrder++;
    });
    saQuestions.forEach((q, idx) => {
      q.orderInPart = idx + 1;
      q.globalOrderIndex = runningOrder++;
    });
    esQuestions.forEach((q, idx) => {
      q.orderInPart = idx + 1;
      q.globalOrderIndex = runningOrder++;
    });

    const mcqStart = mcqQuestions[0]?.globalOrderIndex || 1;
    const mcqEnd = mcqQuestions[mcqQuestions.length - 1]?.globalOrderIndex || mcqQuestions.length;

    const tfStart = tfQuestions[0]?.globalOrderIndex || (mcqEnd + 1);
    const tfEnd = tfQuestions[tfQuestions.length - 1]?.globalOrderIndex || (tfStart + tfQuestions.length - 1);

    const saStart = saQuestions[0]?.globalOrderIndex || (tfEnd + 1);
    const saEnd = saQuestions[saQuestions.length - 1]?.globalOrderIndex || (saStart + saQuestions.length - 1);

    const esStart = esQuestions[0]?.globalOrderIndex || (saEnd + 1);
    const esEnd = esQuestions[esQuestions.length - 1]?.globalOrderIndex || (esStart + esQuestions.length - 1);

    const parts: TestPart[] = [
      {
        partNumber: 1,
        partName: 'PHẦN I. Câu trắc nghiệm nhiều lựa chọn',
        questionType: 'MCQ' as const,
        instructions: `Thí sinh trả lời từ câu ${mcqStart} đến câu ${mcqEnd}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
        totalScore: Math.round(mcqQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
        questions: mcqQuestions
      },
      {
        partNumber: 2,
        partName: 'PHẦN II. Câu trắc nghiệm Đúng/Sai',
        questionType: 'TRUE_FALSE' as const,
        instructions: `Thí sinh trả lời từ câu ${tfStart} đến câu ${tfEnd}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.`,
        totalScore: Math.round(tfQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
        questions: tfQuestions
      },
      {
        partNumber: 3,
        partName: 'PHẦN III. Câu trắc nghiệm trả lời ngắn',
        questionType: 'SHORT_ANSWER' as const,
        instructions: `Thí sinh trả lời từ câu ${saStart} đến câu ${saEnd}. Điền câu trả lời ngắn gọn (thuật ngữ, tên chất hoặc kết quả tính toán). Mỗi câu trả lời đúng được 0.5 điểm.`,
        totalScore: Math.round(saQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
        questions: saQuestions
      },
      {
        partNumber: 4,
        partName: 'PHẦN IV. Tự luận',
        questionType: 'ESSAY' as const,
        instructions: `Thí sinh trả lời từ câu ${esStart} đến câu ${esEnd}. Trình bày chi tiết lời giải, bài tập hoặc lập luận khoa học vào giấy làm bài.`,
        totalScore: Math.round(esQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
        questions: esQuestions
      }
    ].filter(p => p.questions.length > 0);

    // Generate Answer Keys & Rubrics
    const answerKeys: AnswerKeyItem[] = [];
    const rubrics: ScoringRubricItem[] = [];

    parts.forEach(part => {
      part.questions.forEach(tq => {
        answerKeys.push({
          questionNumber: tq.globalOrderIndex,
          partNumber: part.partNumber,
          questionType: tq.question.questionType,
          correctAnswer: tq.question.correctAnswer || '',
          score: tq.assignedScore,
          explanation: tq.question.explanation || ''
        });

        if (tq.question.questionType === 'ESSAY') {
          rubrics.push({
            questionNumber: tq.globalOrderIndex,
            partNumber: part.partNumber,
            criterion: tq.question.correctAnswer || tq.question.explanation || 'Hướng dẫn chấm bài tự luận',
            score: tq.assignedScore
          });
        }
      });
    });

    const termPeriod = resolveExamPeriod(input.matrix);
    const resolvedTitle = input.title && !input.title.includes('ĐỀ KIỂM TRA ĐỊNH KÌ')
      ? input.title
      : `ĐỀ KIỂM TRA ${termPeriod} - KHOA HỌC TỰ NHIÊN ${input.matrix.grade}`;

    const testId = `test-${input.matrix.grade}-${Date.now()}`;
    const testExam: TestExam = {
      id: testId,
      matrixId: input.matrix.id,
      specificationId: input.specification.id,
      testCode: input.testCode || '101',
      title: resolvedTitle,
      schoolName: input.schoolName || 'TRƯỜNG THCS & THPT PHAN VĂN TRỊ',
      departmentName: input.departmentName || 'TỔ KHOA HỌC TỰ NHIÊN',
      grade: input.matrix.grade,
      subjectName: 'Khoa học tự nhiên',
      semester: input.matrix.semester,
      schoolYear: input.matrix.schoolYear,
      durationMinutes: input.matrix.durationMinutes,
      totalScore: 10.0,
      assessmentType: input.matrix.assessmentType,
      parts,
      answerKeys,
      scoringGuide: {
        id: `guide-${testId}`,
        testId: testId,
        totalScore: 10.0,
        rubrics,
        instructions: [
          'Học sinh làm đúng đến bước nào cho điểm bước đó.',
          'Đối với câu trắc nghiệm nhiều lựa chọn: mỗi câu đúng 0.25đ.',
          'Đối với câu Đúng/Sai: mỗi ý đúng 0.25đ.',
          'Đối với câu trả lời ngắn: điền đúng đáp số và đơn vị được 0.5đ.',
          'Đối với câu tự luận: nếu học sinh có cách giải khác đúng vẫn cho điểm tối đa.'
        ]
      },
      contextReport,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localDb.saveTest(testExam);

    return {
      test: testExam,
      matchingResults: matching.results,
      hasMissingQuestions: !matching.isComplete
    };
  }

  public static getTests(): TestExam[] {
    return localDb.getTests();
  }

  public static getTestById(id: string): TestExam | undefined {
    return localDb.getTestById(id);
  }
}
