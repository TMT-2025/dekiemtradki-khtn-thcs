import { GradeLevel, Semester, SubjectArea, ContentDomain, CognitiveLevel, QuestionType } from './curriculum';
import { SourceLevel } from './knowledge';

export interface QuestionOption {
  key: string;       // "A", "B", "C", "D" or "a", "b", "c", "d"
  text: string;      // Option content
  isCorrect?: boolean; // For True/False questions
}

export interface QuestionQualityReport {
  hasSingleCorrect: boolean;
  hasNoSpellingErrors: boolean;
  hasBalancedOptions: boolean;
  hasClearPrompt: boolean;
  hasCurriculumGrounding: boolean;
  isValid: boolean;
  feedbackNotes?: string[];
}

import { ContextMetadata } from './context';

export interface QuestionItem {
  id: string;
  grade: GradeLevel;
  semester: Semester;
  chapterId?: string;
  lessonId: string;
  topic: string;
  subjectArea: SubjectArea;
  contentDomain: ContentDomain;
  learningRequirementId?: string;
  learningRequirementText: string;
  cognitiveLevel: CognitiveLevel;
  questionType: QuestionType;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionText: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  rationale?: string; // Explains cognitive level and alignment
  score: number;
  sourceLevel: SourceLevel;
  sourceCitation?: {
    documentName: string;
    lessonName: string;
    pageOrChapter?: string;
  };
  contextMetadata?: ContextMetadata;
  tags?: string[];
  qualityReport?: QuestionQualityReport;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilter {
  grade?: GradeLevel;
  semester?: Semester;
  lessonId?: string;
  subjectArea?: SubjectArea;
  contentDomain?: ContentDomain;
  cognitiveLevel?: CognitiveLevel;
  questionType?: QuestionType;
  keyword?: string;
}
