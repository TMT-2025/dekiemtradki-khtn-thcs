import { GradeLevel, Semester, SubjectArea, CognitiveLevel, QuestionType } from './curriculum';

export interface SpecificationItem {
  id: string;
  stt: number;
  matrixRowId: string;
  topic: string;
  contentUnit: string;
  lessonId: string;
  learningRequirement: string;
  cognitiveLevel: CognitiveLevel;
  questionType: QuestionType;
  questionCount: number;
  score: number;
  description: string; // Mô tả yêu cầu của câu hỏi (hành động nhận thức, dữ kiện cần khai thác)
  questionNumbers?: string; // Vị trí câu hỏi trong đề, ví dụ: "Câu 1, 2"
}

export interface TestSpecification {
  id: string;
  matrixId: string;
  title: string;
  grade: GradeLevel;
  semester: Semester;
  schoolYear: string;
  durationMinutes: number;
  version: number;
  items: SpecificationItem[];
  createdAt: string;
  updatedAt: string;
}
