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
  mode: 'AUTO' | 'MANUAL' | 'AI';
  generationSource?: 'BANK' | 'AI' | 'HYBRID';
  aiRatio?: number; // e.g. 0.5 (defaults to 0.5 when HYBRID)
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
    const isAIMode = input.mode === 'AI' || input.generationSource === 'AI';
    const isBankMode = input.generationSource === 'BANK';
    const isHybridMode = input.generationSource === 'HYBRID' || input.aiRatio !== undefined;

    const targetAiRatio = isAIMode ? 1.0 : (isBankMode ? 0.0 : (input.aiRatio ?? (isHybridMode ? 0.5 : undefined)));

    const matching = QuestionMatchingEngine.matchAll(input.specification.items, {
      forceAI: isAIMode,
      aiRatio: isHybridMode ? targetAiRatio : undefined
    });
    
    const newlyGeneratedIds = new Set<string>();

    // Auto-generate missing questions concurrently if in AUTO, HYBRID or AI mode
    if ((input.mode === 'AUTO' || isAIMode || isHybridMode) && !matching.isComplete) {
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
              generated.author = 'AI_SYNTHESIZER';
              if (!generated.tags) generated.tags = [];
              if (!generated.tags.includes('AI_GENERATED')) generated.tags.push('AI_GENERATED');

              // Continuously save freshly generated AI questions into bank
              localDb.saveQuestion(generated);
              newlyGeneratedIds.add(generated.id);
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

    // 1. TĂNG CƯỜNG BỐI CẢNH KHOA HỌC THỰC TIỄN Ở PHẦN II (TRUE_FALSE)
    // Ràng buộc: 100% câu hỏi Đúng/Sai phải có bối cảnh ít nhất 25 chữ, bám sát hiện tượng thực tế/thí nghiệm
    for (const q of allQuestions) {
      if (q.questionType === 'TRUE_FALSE') {
        if (!q.contextMetadata?.hasContext || !q.contextMetadata?.stimulus?.leadParagraph) {
          q.contextMetadata = ContextService.generateRichContextForQuestion(q);
        }
        // Đảm bảo nội dung bối cảnh dài ít nhất 25 chữ (từ)
        const lead = q.contextMetadata?.stimulus?.leadParagraph || '';
        const words = lead.trim().split(/\s+/).filter(Boolean).length;
        if (words < 25 && q.contextMetadata && q.contextMetadata.stimulus) {
          q.contextMetadata.stimulus.leadParagraph = `Trong giờ học thực hành môn Khoa học tự nhiên ${q.grade || 6}, học sinh tiến hành quan sát thực nghiệm và thu thập số liệu chi tiết về chủ đề "${q.topic || 'Khoa học tự nhiên'}". Dựa trên các dữ kiện đo lường và hiện tượng ghi nhận được: ` + lead;
        }
      }
    }

    // 2. PHẦN IV (Tự luận) và PHẦN III (Trả lời ngắn): Bổ sung bối cảnh thực tiễn giải quyết vấn đề
    for (const q of allQuestions) {
      if (q.questionType === 'ESSAY' || q.questionType === 'SHORT_ANSWER') {
        if (!q.contextMetadata?.hasContext || !q.contextMetadata?.stimulus?.leadParagraph) {
          q.contextMetadata = ContextService.generateRichContextForQuestion(q);
        }
      }
    }

    // 3. PHẦN I (MCQ): Phần lớn là kiến thức mức độ Biết (NB) theo chương trình (không gán bối cảnh rườm rà).
    // Chỉ các câu M2 (Thông hiểu) hoặc khi cần đạt tỉ lệ mục tiêu mới bổ sung bối cảnh ngắn gọn
    const targetContextCount = Math.round(allQuestions.length * targetRatio);
    const currentContextCount = allQuestions.filter(q => q.contextMetadata?.hasContext).length;
    let neededContext = Math.max(0, targetContextCount - currentContextCount);

    for (const q of allQuestions) {
      if (q.questionType === 'MCQ') {
        if (q.cognitiveLevel !== 'M1' && neededContext > 0) {
          if (!q.contextMetadata?.hasContext) {
            q.contextMetadata = ContextService.generateRichContextForQuestion(q);
            neededContext--;
          }
        } else {
          // Các câu M1 thuần tuý kiến thức Biết thì giữ sạch sẽ
          q.contextMetadata = undefined;
        }
      }
    }

    // Đa dạng hóa hiện tượng và nguồn tài liệu (tránh trùng lặp > 2 lần trong cùng một đề thi)
    const phenomUsage: Record<string, number> = {};
    const sourceUsage: Record<string, number> = {};

    allQuestions.forEach(q => {
      if (q.contextMetadata?.hasContext) {
        const pName = q.contextMetadata.phenomenon || 'Bối cảnh khoa học';
        phenomUsage[pName] = (phenomUsage[pName] || 0) + 1;
        if (phenomUsage[pName] > 2) {
          q.contextMetadata.phenomenon = `${pName} (Góc độ khảo sát ${phenomUsage[pName]} - ${q.topic || 'Ứng dụng'})`;
        }

        const sName = q.contextMetadata.sourceTitle || 'Tài liệu SGK KHTN';
        sourceUsage[sName] = (sourceUsage[sName] || 0) + 1;
        if (sourceUsage[sName] > 2) {
          q.contextMetadata.sourceTitle = `${sName} (Chuyên đề ${q.topic || 'Khảo sát'})`;
        }
      }
    });

    const contextReport = ContextService.generateContextReport(allQuestions, targetRatio);

    const mcqQuestions: TestPartQuestion[] = [];
    const tfQuestions: TestPartQuestion[] = [];
    const saQuestions: TestPartQuestion[] = [];
    const esQuestions: TestPartQuestion[] = [];

    // Collect all matched questions into separate parts first
    matching.results.forEach(res => {
      res.matchedQuestions.forEach(q => {
        const itemScore = res.specItem.score / res.specItem.questionCount;
        const isAI = newlyGeneratedIds.has(q.id) || q.author === 'AI_SYNTHESIZER' || q.tags?.includes('AI_GENERATED');
        const questionSource: 'BANK' | 'AI' = isAI ? 'AI' : 'BANK';

        if (q.questionType === 'MCQ') {
          mcqQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore,
            source: questionSource
          });
        } else if (q.questionType === 'TRUE_FALSE') {
          tfQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore,
            source: questionSource
          });
        } else if (q.questionType === 'SHORT_ANSWER') {
          saQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore,
            source: questionSource
          });
        } else {
          esQuestions.push({
            orderInPart: 0,
            globalOrderIndex: 0,
            question: q,
            assignedScore: itemScore,
            source: questionSource
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
        instructions: `Thí sinh trả lời từ câu ${saStart} đến câu ${saEnd}. Viết con số kết quả tính toán (kèm đơn vị đo quy định) vào ô trả lời. Mỗi câu trả lời đúng được 0.5 điểm.`,
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
      stats: {
        bankQuestionCount: allQuestions.length - newlyGeneratedIds.size,
        aiQuestionCount: newlyGeneratedIds.size,
        totalQuestionCount: allQuestions.length,
        aiRatio: allQuestions.length > 0 ? Math.round((newlyGeneratedIds.size / allQuestions.length) * 100) / 100 : 0.5
      },
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

  /**
   * Regenerates a single question in an existing test using AI
   * strictly adhering to the original lesson, cognitive level, question type, and GDPT 2018 requirements
   */
  public static async regenerateQuestionWithAI(params: {
    testId: string;
    globalOrderIndex: number;
  }): Promise<{
    success: boolean;
    updatedTest?: TestExam;
    newQuestion?: QuestionItem;
    error?: string;
  }> {
    const test = localDb.getTestById(params.testId);
    if (!test) return { success: false, error: 'Không tìm thấy đề thi' };

    let targetPart: TestPart | undefined;
    let targetQIndex = -1;

    for (const part of test.parts) {
      const idx = part.questions.findIndex(q => q.globalOrderIndex === params.globalOrderIndex);
      if (idx >= 0) {
        targetPart = part;
        targetQIndex = idx;
        break;
      }
    }

    if (!targetPart || targetQIndex < 0) {
      return { success: false, error: `Không tìm thấy câu hỏi số ${params.globalOrderIndex}` };
    }

    const oldTestQ = targetPart.questions[targetQIndex];
    const oldQ = oldTestQ.question;

    try {
      const generated = await QuestionService.generateQuestionWithAI({
        lessonId: oldQ.lessonId,
        cognitiveLevel: oldQ.cognitiveLevel,
        questionType: oldQ.questionType,
        score: oldTestQ.assignedScore
      });

      // Context enrichment: Tăng cường bối cảnh thực tiễn ít nhất 25 chữ cho Phần II (Đúng/Sai)
      if (generated.questionType === 'TRUE_FALSE') {
        generated.contextMetadata = ContextService.generateRichContextForQuestion(generated);
        const lead = generated.contextMetadata?.stimulus?.leadParagraph || '';
        const words = lead.trim().split(/\s+/).filter(Boolean).length;
        if (words < 25 && generated.contextMetadata?.stimulus) {
          generated.contextMetadata.stimulus.leadParagraph = `Trong giờ học thực hành môn Khoa học tự nhiên ${generated.grade || 6}, học sinh tiến hành quan sát thực nghiệm và thu thập số liệu chi tiết về chủ đề "${generated.topic}". Căn cứ vào các dữ kiện đo lường và hiện tượng ghi nhận được: ` + lead;
        }
      } else if (generated.questionType === 'ESSAY' || generated.questionType === 'SHORT_ANSWER') {
        generated.contextMetadata = ContextService.generateRichContextForQuestion(generated);
      } else {
        generated.contextMetadata = undefined;
      }

      generated.author = 'AI_SYNTHESIZER';
      if (!generated.tags) generated.tags = [];
      if (!generated.tags.includes('AI_GENERATED')) generated.tags.push('AI_GENERATED');

      // Save to localDb bank
      localDb.saveQuestion(generated);

      // Replace in test
      targetPart.questions[targetQIndex] = {
        ...oldTestQ,
        question: generated,
        source: 'AI'
      };

      // Update answer keys
      const ansIdx = test.answerKeys.findIndex(a => a.questionNumber === params.globalOrderIndex);
      if (ansIdx >= 0) {
        test.answerKeys[ansIdx] = {
          questionNumber: params.globalOrderIndex,
          partNumber: targetPart.partNumber,
          questionType: generated.questionType || targetPart.questionType,
          correctAnswer: generated.correctAnswer || '',
          explanation: generated.explanation || '',
          score: oldTestQ.assignedScore
        };
      }

      // Update scoring rubrics
      if (test.scoringGuide?.rubrics) {
        const rubIdx = test.scoringGuide.rubrics.findIndex(r => r.questionNumber === params.globalOrderIndex);
        if (rubIdx >= 0) {
          test.scoringGuide.rubrics[rubIdx] = {
            questionNumber: params.globalOrderIndex,
            partNumber: targetPart.partNumber,
            criterion: generated.explanation || `Đúng đáp án theo chuẩn kiến thức ${generated.topic}`,
            score: oldTestQ.assignedScore
          };
        }
      }

      test.updatedAt = new Date().toISOString();
      localDb.saveTest(test);

      return {
        success: true,
        updatedTest: test,
        newQuestion: generated
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
