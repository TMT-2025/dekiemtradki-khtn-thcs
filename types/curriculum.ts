export type GradeLevel = 6 | 7 | 8 | 9;

export type Semester = 'HK1' | 'HK2';

export type SubjectArea = 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY' | 'INTEGRATED';

export type ContentDomain = 
  | 'ENERGY_CHANGE'     // Năng lượng và sự biến đổi (Vật lí)
  | 'SUBSTANCE_CHANGE'  // Chất và sự biến đổi của chất (Hóa học)
  | 'SUBSTANCES'        // Alias for SUBSTANCE_CHANGE
  | 'ENERGY'            // Alias for ENERGY_CHANGE
  | 'LIVING_THINGS'     // Vật sống (Sinh học)
  | 'EARTH_SPACE'       // Trái Đất và bầu trời (Vật lí / Thiên văn)
  | 'INTEGRATED_INTRO'; // Mở đầu về KHTN / Kĩ năng

export type CognitiveLevel = 'M1' | 'M2' | 'M3' | 'M4'; 
// M1 = Nhận biết (NB), M2 = Thông hiểu (TH), M3 = Vận dụng (VD), M4 = Vận dụng cao (VDC)

export type QuestionType = 
  | 'MCQ'           // Trắc nghiệm nhiều lựa chọn (4 phương án, 1 đáp án đúng)
  | 'TRUE_FALSE'     // Trắc nghiệm Đúng/Sai (4 ý a, b, c, d)
  | 'SHORT_ANSWER'   // Trắc nghiệm trả lời ngắn (điền số / từ khóa)
  | 'ESSAY';         // Tự luận

export interface Chapter {
  id: string;
  grade: GradeLevel;
  semester: Semester;
  chapterNumber: string;
  title: string;
  subjectArea: SubjectArea;
  contentDomain: ContentDomain;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  grade: GradeLevel;
  semester: Semester;
  lessonNumber: number;
  title: string;
  periods: number;
  subjectArea: SubjectArea;
  contentDomain: ContentDomain;
  learningRequirements: LearningRequirement[];
}

export interface LearningRequirement {
  id: string;
  lessonId: string;
  code: string;
  description: string;
  cognitiveLevel: CognitiveLevel;
  subjectArea: SubjectArea;
  contentDomain: ContentDomain;
  sourceDocId?: string;
}

export interface CurriculumScope {
  grade: GradeLevel;
  schoolYear: string;
  semester: Semester;
  assessmentType: 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'OTHER';
  selectedLessonIds: string[];
}
