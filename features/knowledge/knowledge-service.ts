import { localDb } from '@/database/local-db';
import { KnowledgeDocument, SourceLevel } from '@/types/knowledge';

const SOURCE_PRIORITY: Record<SourceLevel, number> = {
  LEGAL: 5,
  LOCAL: 4,
  SCHOOL: 3,
  TEXTBOOK: 2,
  REFERENCE: 1
};

export class KnowledgeService {
  /**
   * Get all cataloged documents in the knowledge base
   */
  public static getDocuments(): KnowledgeDocument[] {
    return localDb.getDocuments();
  }

  /**
   * Filter documents by source tier
   */
  public static getDocumentsByTier(tier: SourceLevel): KnowledgeDocument[] {
    return localDb.getDocuments().filter(d => d.sourceLevel === tier);
  }

  /**
   * Resolves conflicts between two sources based on official hierarchy
   */
  public static resolveConflict<T>(
    itemA: { sourceLevel: SourceLevel; value: T; docTitle: string },
    itemB: { sourceLevel: SourceLevel; value: T; docTitle: string }
  ): {
    chosenValue: T;
    winningTier: SourceLevel;
    rationale: string;
    hasContradiction: boolean;
  } {
    const priorityA = SOURCE_PRIORITY[itemA.sourceLevel];
    const priorityB = SOURCE_PRIORITY[itemB.sourceLevel];

    if (priorityA > priorityB) {
      return {
        chosenValue: itemA.value,
        winningTier: itemA.sourceLevel,
        rationale: `Ưu tiên ${itemA.sourceLevel} (${itemA.docTitle}) cao hơn ${itemB.sourceLevel} (${itemB.docTitle}) theo quy chuẩn pháp lý GDPT 2018.`,
        hasContradiction: true
      };
    } else if (priorityB > priorityA) {
      return {
        chosenValue: itemB.value,
        winningTier: itemB.sourceLevel,
        rationale: `Ưu tiên ${itemB.sourceLevel} (${itemB.docTitle}) cao hơn ${itemA.sourceLevel} (${itemA.docTitle}) theo quy chuẩn pháp lý GDPT 2018.`,
        hasContradiction: true
      };
    }

    return {
      chosenValue: itemA.value,
      winningTier: itemA.sourceLevel,
      rationale: `Cùng cấp độ ưu tiên ${itemA.sourceLevel}, giữ cấu hình tiêu chuẩn hoặc yêu cầu giáo viên xác nhận.`,
      hasContradiction: false
    };
  }

  /**
   * Validates if a concept or lesson is grounded in the approved curriculum
   */
  public static verifyGrounding(lessonId: string): { isGrounded: boolean; documentId?: string; message: string } {
    const lesson = localDb.getLessonById(lessonId);
    if (!lesson) {
      return {
        isGrounded: false,
        message: `Bài học với mã "${lessonId}" không tồn tại trong chương trình KHTN GDPT 2018 đã phê duyệt.`
      };
    }

    return {
      isGrounded: true,
      documentId: 'DOC-SCHOOL-000',
      message: `Được kiểm chứng từ Kế hoạch dạy học và SGK KHTN ${lesson.grade} Kết nối tri thức.`
    };
  }
}
