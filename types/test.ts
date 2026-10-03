import { GradeLevel, Semester, QuestionType } from './curriculum';
import { QuestionItem } from './question';

export interface TestPartQuestion {
  orderInPart: number;
  globalOrderIndex: number;
  question: QuestionItem;
  assignedScore: number;
  source?: 'BANK' | 'AI';
}

export interface TestPart {
  partNumber: number;
  partName: string;
  questionType: QuestionType;
  instructions: string;
  totalScore: number;
  questions: TestPartQuestion[];
}

export interface AnswerKeyItem {
  questionNumber: number;
  partNumber: number;
  questionType: QuestionType;
  correctAnswer: string;
  score: number;
  explanation: string;
}

export interface ScoringRubricItem {
  questionNumber: number;
  partNumber: number;
  subItem?: string; // e.g. "a", "b", "c", "d" or ý 1, ý 2
  criterion: string;
  score: number;
}

export interface ScoringGuide {
  id: string;
  testId: string;
  totalScore: number;
  rubrics: ScoringRubricItem[];
  instructions: string[];
}

import { ContextReport } from './context';

export interface TestExam {
  id: string;
  matrixId: string;
  specificationId: string;
  testCode: string; // e.g. "101", "102"
  title: string;
  schoolName: string;
  departmentName: string;
  grade: GradeLevel;
  subjectName: string;
  semester: Semester;
  schoolYear: string;
  durationMinutes: number;
  totalScore: number;
  assessmentType?: string;
  parts: TestPart[];
  answerKeys: AnswerKeyItem[];
  scoringGuide: ScoringGuide;
  contextReport?: ContextReport;
  stats?: {
    bankQuestionCount: number;
    aiQuestionCount: number;
    totalQuestionCount: number;
    aiRatio: number;
  };
  createdAt: string;
  updatedAt: string;
}
