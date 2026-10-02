export type SourceLevel = 
  | 'LEGAL'       // Level 1: Pháp lý, Thông tư 32/2018, TT 22/2021, CV 7991
  | 'LOCAL'       // Level 2: Văn bản Sở/Phòng GDĐT (CV 984...)
  | 'SCHOOL'      // Level 3: Kế hoạch dạy học nhà trường (KHDH THCS Phan Văn Trị)
  | 'TEXTBOOK'    // Level 4: Sách giáo khoa Kết nối tri thức 6, 7, 8, 9
  | 'REFERENCE';  // Level 5: Tài liệu tham khảo, hướng dẫn ma trận

export interface KnowledgeDocument {
  documentId: string;
  fileName: string;
  title: string;
  documentType: string;
  grade: string;
  subject: string;
  schoolYear: string;
  sourceLevel: SourceLevel;
  effectiveDate: string;
  version: string;
  status: 'ACTIVE' | 'ARCHIVED';
  relativePath: string;
}

export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  grade?: number;
  semester?: string;
  chapter?: string;
  lesson?: string;
  subjectArea?: string;
  sourceLevel: SourceLevel;
  page?: number;
  content: string;
}
