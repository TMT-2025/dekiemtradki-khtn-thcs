import fs from 'fs';
import path from 'path';
import { assertDatabaseSafety } from '@/lib/supabase/database-safety';
import { GradeLevel, Semester, Lesson, Chapter, SubjectArea, ContentDomain } from '@/types/curriculum';
import { AssessmentTemplate, AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { QuestionItem } from '@/types/question';
import { TestExam } from '@/types/test';
import { KnowledgeDocument } from '@/types/knowledge';

interface DatabaseData {
  grades: { code: GradeLevel; name: string; totalPeriods: number }[];
  chapters: Chapter[];
  lessons: Lesson[];
  templates: AssessmentTemplate[];
  matrices: AssessmentMatrix[];
  specifications: TestSpecification[];
  questionBank: QuestionItem[];
  tests: TestExam[];
  documents: KnowledgeDocument[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'database', 'local_store.json');
const CURRICULUM_DATA_PATH = path.join(process.cwd(), 'database', 'curriculum-data.json');
const CATALOG_PATH = path.join(process.cwd(), 'knowledge', 'catalog.json');

class LocalDatabase {
  private data: DatabaseData;

  constructor() {
    this.data = this.initialize();
  }

  private initialize(): DatabaseData {
    // Phase 8.3: Fail-Fast if production Supabase is required but unconfigured
    assertDatabaseSafety();

    // If local_store.json exists, load it
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
        if (raw && raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.grades) && parsed.grades.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error loading existing local store, falling back to bootstrap', e);
      }
    }

    // Otherwise load curriculum and knowledge catalog
    let curriculum: any = { grades: [], chapters: [], lessons: [] };
    if (fs.existsSync(CURRICULUM_DATA_PATH)) {
      curriculum = JSON.parse(fs.readFileSync(CURRICULUM_DATA_PATH, 'utf8'));
    }

    let catalog: KnowledgeDocument[] = [];
    if (fs.existsSync(CATALOG_PATH)) {
      catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    }

    const defaultTemplates: AssessmentTemplate[] = [
      {
        id: 'tpl-cv984-local',
        name: 'Cấu trúc theo Hướng dẫn Sở GD&ĐT Vĩnh Long (CV 984 / CV 7991)',
        code: 'TEMPLATE_B_LOCAL',
        description: 'Cấu trúc 4 phần chuẩn: Phần I (14 MCQ - 3.5đ), Phần II (2 Đ/S - 2.0đ), Phần III (3 TLN - 1.5đ), Phần IV (3 TL - 3.0đ)',
        durationMinutes: 60,
        totalScore: 10.0,
        enableM4: true,
        cognitiveLevelTarget: { M1: 40, M2: 30, M3: 20, M4: 10 },
        parts: [
          {
            partNumber: 1,
            name: 'Phần I: Trắc nghiệm nhiều lựa chọn',
            questionType: 'MCQ',
            questionCount: 14,
            scorePerQuestion: 0.25,
            totalScore: 3.5,
            description: 'Mỗi câu có 4 phương án, chọn 1 đáp án đúng.'
          },
          {
            partNumber: 2,
            name: 'Phần II: Trắc nghiệm Đúng/Sai',
            questionType: 'TRUE_FALSE',
            questionCount: 2,
            scorePerQuestion: 1.0,
            totalScore: 2.0,
            description: 'Mỗi câu có 4 lệnh hỏi a, b, c, d (mỗi ý 0.25đ).'
          },
          {
            partNumber: 3,
            name: 'Phần III: Trắc nghiệm trả lời ngắn',
            questionType: 'SHORT_ANSWER',
            questionCount: 3,
            scorePerQuestion: 0.5,
            totalScore: 1.5,
            description: 'Điền đáp số tính toán hoặc đại lượng chính xác.'
          },
          {
            partNumber: 4,
            name: 'Phần IV: Tự luận',
            questionType: 'ESSAY',
            questionCount: 3,
            scorePerQuestion: 1.0,
            totalScore: 3.0,
            description: 'Giải thích hiện tượng, lập luận và bài tập tự luận.'
          }
        ]
      },
      {
        id: 'tpl-default-balanced',
        name: 'Cấu trúc mặc định hệ thống (Template A - Trắc nghiệm 40% & Tự luận 60%)',
        code: 'TEMPLATE_A',
        description: 'Cấu trúc truyền thống: 16 câu trắc nghiệm nhiều lựa chọn (4.0đ) kết hợp 4 câu tự luận (6.0đ)',
        durationMinutes: 60,
        totalScore: 10.0,
        enableM4: true,
        cognitiveLevelTarget: { M1: 40, M2: 30, M3: 20, M4: 10 },
        parts: [
          {
            partNumber: 1,
            name: 'Phần I: Trắc nghiệm khách quan',
            questionType: 'MCQ',
            questionCount: 16,
            scorePerQuestion: 0.25,
            totalScore: 4.0,
            description: '16 câu hỏi trắc nghiệm nhiều lựa chọn (12 NB, 4 TH).'
          },
          {
            partNumber: 2,
            name: 'Phần II: Tự luận',
            questionType: 'ESSAY',
            questionCount: 4,
            scorePerQuestion: 1.5,
            totalScore: 6.0,
            description: '4 câu tự luận phân hóa (NB 1.0đ, TH 2.0đ, VD 2.0đ, VDC 1.0đ).'
          }
        ]
      }
    ];

    const initialData: DatabaseData = {
      grades: curriculum.grades || [],
      chapters: curriculum.chapters || [],
      lessons: curriculum.lessons || [],
      templates: defaultTemplates,
      matrices: [],
      specifications: [],
      questionBank: [],
      tests: [],
      documents: catalog || []
    };

    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write initial local_store.json', e);
    }

    return initialData;
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist database to file', e);
    }
  }

  // --- Curriculum Accessors ---
  public getGrades() {
    return this.data.grades;
  }

  public getChapters(grade: GradeLevel, semester?: Semester) {
    return this.data.chapters.filter(c => c.grade === grade && (!semester || c.semester === semester));
  }

  public getLessons(grade: GradeLevel, semester?: Semester) {
    return this.data.lessons.filter(l => l.grade === grade && (!semester || l.semester === semester));
  }

  public getLessonById(lessonId: string): Lesson | undefined {
    return this.data.lessons.find(l => l.id === lessonId);
  }

  // --- Template Accessors ---
  public getTemplates(): AssessmentTemplate[] {
    return this.data.templates;
  }

  public getTemplateById(id: string): AssessmentTemplate | undefined {
    return this.data.templates.find(t => t.id === id);
  }

  public saveTemplate(template: AssessmentTemplate) {
    const idx = this.data.templates.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      this.data.templates[idx] = template;
    } else {
      this.data.templates.push(template);
    }
    this.save();
    return template;
  }

  // --- Matrix Accessors ---
  public getMatrices(grade?: GradeLevel): AssessmentMatrix[] {
    if (!grade) return this.data.matrices;
    return this.data.matrices.filter(m => m.grade === grade);
  }

  public getMatrixById(id: string): AssessmentMatrix | undefined {
    return this.data.matrices.find(m => m.id === id);
  }

  public saveMatrix(matrix: AssessmentMatrix): AssessmentMatrix {
    const idx = this.data.matrices.findIndex(m => m.id === matrix.id);
    if (idx >= 0) {
      this.data.matrices[idx] = matrix;
    } else {
      this.data.matrices.push(matrix);
    }
    this.save();
    return matrix;
  }

  public deleteMatrix(id: string): boolean {
    const initialLen = this.data.matrices.length;
    this.data.matrices = this.data.matrices.filter(m => m.id !== id);
    this.save();
    return this.data.matrices.length < initialLen;
  }

  // --- Specification Accessors ---
  public getSpecificationByMatrixId(matrixId: string): TestSpecification | undefined {
    return this.data.specifications.find(s => s.matrixId === matrixId);
  }

  public saveSpecification(spec: TestSpecification): TestSpecification {
    const idx = this.data.specifications.findIndex(s => s.id === spec.id);
    if (idx >= 0) {
      this.data.specifications[idx] = spec;
    } else {
      this.data.specifications.push(spec);
    }
    this.save();
    return spec;
  }

  // --- Question Bank Accessors ---
  public getQuestions(): QuestionItem[] {
    return this.data.questionBank;
  }

  public getQuestionById(id: string): QuestionItem | undefined {
    return this.data.questionBank.find(q => q.id === id);
  }

  public saveQuestion(question: QuestionItem): QuestionItem {
    const idx = this.data.questionBank.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      this.data.questionBank[idx] = question;
    } else {
      this.data.questionBank.push(question);
    }
    this.save();
    return question;
  }

  public saveQuestions(questions: QuestionItem[]): void {
    questions.forEach(q => {
      const idx = this.data.questionBank.findIndex(item => item.id === q.id);
      if (idx >= 0) {
        this.data.questionBank[idx] = q;
      } else {
        this.data.questionBank.push(q);
      }
    });
    this.save();
  }

  public deleteQuestion(id: string): boolean {
    const initialLen = this.data.questionBank.length;
    this.data.questionBank = this.data.questionBank.filter(q => q.id !== id);
    this.save();
    return this.data.questionBank.length < initialLen;
  }

  // --- Test Accessors ---
  public getTests(): TestExam[] {
    return this.data.tests;
  }

  public getTestById(id: string): TestExam | undefined {
    return this.data.tests.find(t => t.id === id);
  }

  public saveTest(test: TestExam): TestExam {
    const idx = this.data.tests.findIndex(t => t.id === test.id);
    if (idx >= 0) {
      this.data.tests[idx] = test;
    } else {
      this.data.tests.push(test);
    }
    this.save();
    return test;
  }

  // --- Knowledge Catalog ---
  public getDocuments(): KnowledgeDocument[] {
    return this.data.documents;
  }
}

// Singleton local database instance
export const localDb = new LocalDatabase();
