import { GradeLevel, Semester, SubjectArea, ContentDomain, CognitiveLevel, QuestionType } from './curriculum';

export type AssessmentType = 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'OTHER';

export interface AssessmentTemplatePart {
  partNumber: number;
  name: string;
  questionType: QuestionType;
  questionCount: number;
  scorePerQuestion: number;
  totalScore: number;
  description: string;
  notes?: string;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  code: 'TEMPLATE_A' | 'TEMPLATE_B_LOCAL' | 'TEMPLATE_CUSTOM';
  description: string;
  durationMinutes: number;
  totalScore: number;
  cognitiveLevelTarget: {
    M1: number; // e.g. 40%
    M2: number; // e.g. 30%
    M3: number; // e.g. 20%
    M4: number; // e.g. 10%
  };
  enableM4: boolean;
  parts: AssessmentTemplatePart[];
}

export interface MatrixCellExplain {
  lessonId: string;
  lessonName: string;
  grade: GradeLevel;
  periods: number;
  learningRequirementText: string;
  cognitiveLevel: CognitiveLevel;
  reason: string;
  sourceDocument: string;
  pageOrSection?: string;
}

export interface MatrixCellDistribution {
  count: number;
  score: number;
  questionType: QuestionType;
  explain?: MatrixCellExplain;
}

export interface MatrixRow {
  id: string;
  orderIndex: number;
  topicName: string;
  contentUnit: string;
  lessonId: string;
  chapterId?: string;
  subjectArea: SubjectArea;
  contentDomain: ContentDomain;
  periods: number;
  weightPercentage: number;
  
  // MCQ items by cognitive level
  nbMcq: number;
  thMcq: number;
  vdMcq: number;
  vdcMcq: number;

  // True/False items
  nbTf: number;
  thTf: number;
  vdTf: number;
  vdcTf: number;

  // Short answer items
  nbSa: number;
  thSa: number;
  vdSa: number;
  vdcSa: number;

  // Essay items
  nbEs: number;
  thEs: number;
  vdEs: number;
  vdcEs: number;

  totalQuestions: number;
  totalScore: number;
  percentage: number;
  
  explainNotes?: Record<string, MatrixCellExplain>;
}

export interface AssessmentMatrix {
  id: string;
  userId?: string;
  title: string;
  grade: GradeLevel;
  schoolYear: string;
  semester: Semester;
  assessmentType: AssessmentType;
  templateId: string;
  durationMinutes: number;
  enableM4: boolean;
  contextRatio?: number; // Tỉ lệ câu hỏi có bối cảnh: 0.2 - 1.0, mặc định 0.5 (50%)
  version: number;
  status: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
  rows: MatrixRow[];
  totalQuestions: number;
  totalScore: number;
  totalPercentage: number;
  summaryByDomain: {
    physics: { periods: number; score: number; percentage: number };
    chemistry: { periods: number; score: number; percentage: number };
    biology: { periods: number; score: number; percentage: number };
  };
  summaryByCognitive: {
    M1: { questions: number; score: number; percentage: number };
    M2: { questions: number; score: number; percentage: number };
    M3: { questions: number; score: number; percentage: number };
    M4: { questions: number; score: number; percentage: number };
  };
  summaryByQuestionType: {
    MCQ: { count: number; score: number };
    TRUE_FALSE: { count: number; score: number };
    SHORT_ANSWER: { count: number; score: number };
    ESSAY: { count: number; score: number };
  };
  createdAt: string;
  updatedAt: string;
}
