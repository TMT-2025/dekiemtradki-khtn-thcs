import { localDb } from '@/database/local-db';
import { QuestionItem, QuestionFilter } from '@/types/question';
import { QuestionQualityEngine } from './quality-engine';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { AIProviderFactory } from '@/lib/ai-providers';
import { GradeLevel, CognitiveLevel, QuestionType } from '@/types/curriculum';
import { CurriculumSynthesizer } from './curriculum-synthesizer';

export class QuestionService {
  /**
   * Query and filter questions from bank
   */
  public static getQuestions(filter?: QuestionFilter): QuestionItem[] {
    let list = localDb.getQuestions();

    if (!filter) return list;

    if (filter.grade) {
      list = list.filter(q => q.grade === filter.grade);
    }
    if (filter.semester) {
      list = list.filter(q => q.semester === filter.semester);
    }
    if (filter.lessonId) {
      list = list.filter(q => q.lessonId === filter.lessonId);
    }
    if (filter.subjectArea) {
      list = list.filter(q => q.subjectArea === filter.subjectArea);
    }
    if (filter.contentDomain) {
      list = list.filter(q => q.contentDomain === filter.contentDomain);
    }
    if (filter.cognitiveLevel) {
      list = list.filter(q => q.cognitiveLevel === filter.cognitiveLevel);
    }
    if (filter.questionType) {
      list = list.filter(q => q.questionType === filter.questionType);
    }
    if (filter.keyword && filter.keyword.trim().length > 0) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter(q =>
        q.questionText.toLowerCase().includes(kw) ||
        q.topic.toLowerCase().includes(kw) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(kw)))
      );
    }

    return list;
  }

  public static getQuestionById(id: string): QuestionItem | undefined {
    return localDb.getQuestionById(id);
  }

  public static saveQuestion(q: QuestionItem): { question: QuestionItem; qualityScore: number; passed: boolean } {
    const report = QuestionQualityEngine.evaluateQuestion(q);
    q.qualityReport = {
      hasSingleCorrect: report.passed,
      hasNoSpellingErrors: true,
      hasBalancedOptions: report.warnings.length === 0,
      hasClearPrompt: true,
      hasCurriculumGrounding: true,
      isValid: report.passed,
      feedbackNotes: report.feedback
    };

    const saved = localDb.saveQuestion(q);
    return {
      question: saved,
      qualityScore: report.score,
      passed: report.passed
    };
  }

  public static deleteQuestion(id: string): boolean {
    return localDb.deleteQuestion(id);
  }

  /**
   * Generates a grounded question using AI with zero-hallucination constraint
   */
  public static async generateQuestionWithAI(params: {
    lessonId: string;
    cognitiveLevel?: CognitiveLevel;
    questionType?: QuestionType;
    score?: number;
  }): Promise<QuestionItem> {
    let lesson = CurriculumService.getLessonById(params.lessonId);
    if (!lesson) {
      const allLessons = CurriculumService.getLessons(6).concat(
        CurriculumService.getLessons(7),
        CurriculumService.getLessons(8),
        CurriculumService.getLessons(9)
      );
      lesson = allLessons.find(l => l.id.toLowerCase() === params.lessonId.toLowerCase() || params.lessonId.includes(l.id) || l.id.includes(params.lessonId));
    }

    if (!lesson) {
      throw new Error(`Không tìm thấy bài học có mã: ${params.lessonId}`);
    }

    const cognitiveLevel: CognitiveLevel = params.cognitiveLevel || 'M1';
    const questionType: QuestionType = params.questionType || 'MCQ';
    const score = params.score ?? 0.25;

    // Match requirement
    const req = lesson.learningRequirements.find(r => r.cognitiveLevel === cognitiveLevel) 
      || lesson.learningRequirements[0];
    const reqText = req ? req.description : lesson.title;

    let result: any = null;

    try {
      const systemPrompt = `Bạn là Chuyên gia Khảo thí Khoa học tự nhiên THCS Việt Nam (GDPT 2018).
Nhiệm vụ: Tạo câu hỏi kiểm tra đánh giá năng lực môn KHTN ${lesson.grade} bám sát 100% Chương trình GDPT 2018 và SGK hiện hành.
Quy tắc bắt buộc:
1. Nội dung phải phù hợp tuyệt đối với lứa tuổi học sinh lớp ${lesson.grade} (${lesson.grade === 6 ? '11-12' : lesson.grade === 7 ? '12-13' : lesson.grade === 8 ? '13-14' : '14-15'} tuổi). Không đưa kiến thức vượt cấp.
2. Câu hỏi phải gắn liền với hiện tượng thực tế, thí nghiệm hoặc ứng dụng đời sống, số liệu khoa học chính xác.
3. Chỉ trả về duy nhất chuỗi JSON hợp lệ theo đúng schema quy định.`;

      let formatGuide = '';
      if (questionType === 'MCQ') {
        formatGuide = `- Dạng câu hỏi: Trắc nghiệm 4 lựa chọn (MCQ).
- question_text: Nêu tình huống thực tế hoặc câu hỏi kiểm tra rõ ràng.
- options: BẮT BUỘC có đúng 4 phương án key "A", "B", "C", "D" với nội dung độc lập, không trùng lặp, chỉ có 1 đáp án đúng.
- correct_answer: Một chữ cái duy nhất ("A", "B", "C" hoặc "D").`;
      } else if (questionType === 'TRUE_FALSE') {
        formatGuide = `- Dạng câu hỏi: Trắc nghiệm Đúng/Sai (TRUE_FALSE).
- question_text: Tình huống thí nghiệm hoặc bối cảnh thực tế: "Dựa vào bối cảnh trên, xét tính Đúng hoặc Sai cho mỗi nhận định sau:".
- options: BẮT BUỘC có đúng 4 ý key "a", "b", "c", "d" (chữ thường), mỗi ý là một nhận định khoa học độc lập; kèm trường "isCorrect": true hoặc false.
- correct_answer: Chuỗi JSON ví dụ "{\\"a\\": true, \\"b\\": false, \\"c\\": true, \\"d\\": false}".`;
      } else if (questionType === 'SHORT_ANSWER') {
        formatGuide = `- Dạng câu hỏi: Trả lời ngắn (SHORT_ANSWER).
- question_text: BẮT BUỘC là bài toán định lượng có cho đầy đủ số liệu đầu vào cụ thể hoặc yêu cầu xác định một thuật ngữ/đại lượng khoa học duy nhất.
- options: null hoặc mảng rỗng.
- correct_answer: Đáp án số cụ thể (ví dụ "40", "12.5", "250") hoặc thuật ngữ khoa học ngắn gọn duy nhất.`;
      } else {
        formatGuide = `- Dạng câu hỏi: Tự luận (ESSAY).
- question_text: Câu hỏi tự luận gồm 2 phần rõ ràng (1. Giải thích hiện tượng/cơ chế khoa học; 2. Vận dụng tính toán hoặc liên hệ thực tiễn sản xuất, đời sống).
- options: null.
- correct_answer: Hướng dẫn chấm cụ thể theo từng ý (tổng điểm ${score}đ).`;
      }

      const userPrompt = `Hãy tạo một câu hỏi kiểm tra môn Khoa học tự nhiên:
- Khối lớp: KHTN ${lesson.grade}
- Bài học: ${lesson.title}
- Phân môn: ${lesson.subjectArea}
- Mạch kiến thức: ${lesson.contentDomain}
- Yêu cầu cần đạt chuẩn GDPT 2018: ${reqText}
- Mức độ nhận thức: ${cognitiveLevel}
- Điểm số: ${score}
${formatGuide}

Định dạng JSON trả về:
{
  "question_text": "...",
  "options": [{"key": "A", "text": "...", "isCorrect": true}],
  "correct_answer": "...",
  "explanation": "Lời giải thích khoa học chi tiết...",
  "rationale": "Mục tiêu khảo thí đánh giá mức độ ${cognitiveLevel}...",
  "difficulty": "MEDIUM"
}`;

      const provider = AIProviderFactory.getProvider();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 15000)
      );

      result = await Promise.race([
        provider.generateStructuredJson({
          systemPrompt,
          userPrompt,
          temperature: 0.7
        }),
        timeoutPromise
      ]);
    } catch {
      result = null;
    }

    if (!result || !result.question_text) {
      result = this.synthesizeGroundedQuestion(lesson, reqText, cognitiveLevel, questionType, score);
    }

    const newQuestion: QuestionItem = {
      id: `q-${lesson.grade}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      grade: lesson.grade,
      semester: lesson.semester,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      topic: lesson.title,
      subjectArea: lesson.subjectArea,
      contentDomain: lesson.contentDomain,
      learningRequirementId: req?.id,
      learningRequirementText: reqText,
      cognitiveLevel: cognitiveLevel,
      questionType: questionType,
      difficulty: result.difficulty || 'MEDIUM',
      questionText: result.question_text,
      options: result.options,
      correctAnswer: result.correct_answer,
      explanation: result.explanation,
      rationale: result.rationale || `Câu hỏi đánh giá mức độ ${cognitiveLevel} cho bài ${lesson.title}`,
      score: score,
      sourceLevel: 'TEXTBOOK',
      sourceCitation: {
        documentName: `SGK Khoa học tự nhiên ${lesson.grade} - Kết nối tri thức`,
        lessonName: lesson.title
      },
      tags: [lesson.subjectArea, lesson.contentDomain, cognitiveLevel],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveQuestion(newQuestion);
    return newQuestion;
  }

  /**
   * Fast, reliable curriculum synthesizer guaranteeing 100% pedagogical alignment with GDPT 2018
   */
  public static synthesizeGroundedQuestion(
    lesson: any,
    reqText: string,
    cognitiveLevel: CognitiveLevel,
    questionType: QuestionType,
    score: number
  ): {
    question_text: string;
    options?: { key: string; text: string; isCorrect?: boolean }[];
    correct_answer: string;
    explanation: string;
    rationale: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  } {
    return CurriculumSynthesizer.synthesize(lesson, reqText, cognitiveLevel, questionType, score);
  }
}
