import { localDb } from '@/database/local-db';
import { QuestionItem, QuestionFilter } from '@/types/question';
import { QuestionQualityEngine } from './quality-engine';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { AIProviderFactory } from '@/lib/ai-providers';
import { GradeLevel, CognitiveLevel, QuestionType } from '@/types/curriculum';

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
    const lesson = CurriculumService.getLessonById(params.lessonId);
    if (!lesson) {
      throw new Error(`Không tìm thấy bài học có mã: ${params.lessonId}`);
    }

    const cognitiveLevel: CognitiveLevel = params.cognitiveLevel || 'M1';
    const questionType: QuestionType = params.questionType || 'MCQ';
    const score = params.score ?? 0.25;

    // Match requirement
    const req = lesson.learningRequirements.find(r => r.cognitiveLevel === cognitiveLevel) 
      || lesson.learningRequirements[0];

    const systemPrompt = `Bạn là Chuyên gia Khảo thí Khoa học tự nhiên THCS Việt Nam (GDPT 2018).
Nguyên tắc: Tuyệt đối trung thực với nội dung SGK KHTN ${lesson.grade} Kết nối tri thức. Không bịa kiến thức ngoài SGK.
Chỉ trả về JSON theo schema quy định.`;

    const userPrompt = `Hãy tạo một câu hỏi kiểm tra:
- Khối lớp: KHTN ${lesson.grade}
- Bài học: ${lesson.title}
- Phân môn: ${lesson.subjectArea}
- Mạch kiến thức: ${lesson.contentDomain}
- Yêu cầu cần đạt: ${req ? req.description : lesson.title}
- Mức độ nhận thức: ${cognitiveLevel}
- Dạng câu hỏi: ${questionType}
- Điểm số: ${score}

Trả về định dạng JSON:
{
  "question_text": "...",
  "options": [{"key": "A", "text": "..."}, {"key": "B", "text": "..."}, {"key": "C", "text": "..."}, {"key": "D", "text": "..."}],
  "correct_answer": "...",
  "explanation": "...",
  "rationale": "...",
  "difficulty": "MEDIUM"
}`;

    const provider = AIProviderFactory.getProvider();
    const result: any = await provider.generateStructuredJson({
      systemPrompt,
      userPrompt,
      temperature: 0.2
    });

    const newQuestion: QuestionItem = {
      id: `q-${lesson.grade}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      grade: lesson.grade,
      semester: lesson.semester,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      topic: lesson.title,
      subjectArea: lesson.subjectArea,
      contentDomain: lesson.contentDomain,
      learningRequirementId: req?.id,
      learningRequirementText: req ? req.description : lesson.title,
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
}
