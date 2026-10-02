import { AssessmentMatrix, MatrixRow } from '@/types/matrix';
import { TestSpecification, SpecificationItem } from '@/types/specification';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { CognitiveLevel, QuestionType } from '@/types/curriculum';

export class SpecEngine {
  /**
   * Generates a Test Specification directly mapped 1-to-1 from an Assessment Matrix
   */
  public static generateFromMatrix(matrix: AssessmentMatrix): TestSpecification {
    const items: SpecificationItem[] = [];
    let stt = 1;
    let globalQuestionNumber = 1;

    matrix.rows.forEach(row => {
      const lesson = CurriculumService.getLessonById(row.lessonId);
      const reqs = lesson ? lesson.learningRequirements : [];

      const getReqForLevel = (level: CognitiveLevel): string => {
        const found = reqs.find(r => r.cognitiveLevel === level);
        if (found) return found.description;
        if (reqs.length > 0) return reqs[0].description;
        return `Yêu cầu cần đạt theo chương trình KHTN ${matrix.grade} bài ${row.contentUnit}`;
      };

      // Process MCQ
      if (row.nbMcq > 0) {
        items.push({
          id: `spec-${row.id}-nb-mcq`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M1'),
          cognitiveLevel: 'M1',
          questionType: 'MCQ',
          questionCount: row.nbMcq,
          score: Math.round(row.nbMcq * 0.25 * 100) / 100,
          description: `Nhận biết các khái niệm, định nghĩa cơ bản liên quan đến ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.nbMcq)
        });
        globalQuestionNumber += row.nbMcq;
      }

      if (row.thMcq > 0) {
        items.push({
          id: `spec-${row.id}-th-mcq`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M2'),
          cognitiveLevel: 'M2',
          questionType: 'MCQ',
          questionCount: row.thMcq,
          score: Math.round(row.thMcq * 0.25 * 100) / 100,
          description: `Thông hiểu bản chất, phân biệt các dấu hiệu và giải thích hiện tượng của ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.thMcq)
        });
        globalQuestionNumber += row.thMcq;
      }

      // Process True/False
      if (row.thTf > 0) {
        items.push({
          id: `spec-${row.id}-th-tf`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M2'),
          cognitiveLevel: 'M2',
          questionType: 'TRUE_FALSE',
          questionCount: row.thTf,
          score: Math.round(row.thTf * 1.0 * 100) / 100,
          description: `Đánh giá tính đúng/sai của 4 nhận định khoa học về bản chất của ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.thTf)
        });
        globalQuestionNumber += row.thTf;
      }

      if (row.vdTf > 0) {
        items.push({
          id: `spec-${row.id}-vd-tf`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M3'),
          cognitiveLevel: 'M3',
          questionType: 'TRUE_FALSE',
          questionCount: row.vdTf,
          score: Math.round(row.vdTf * 1.0 * 100) / 100,
          description: `Phân tích tình huống thực tế gồm 4 nhận định độc lập về ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.vdTf)
        });
        globalQuestionNumber += row.vdTf;
      }

      // Process Short Answer
      if (row.vdSa > 0) {
        items.push({
          id: `spec-${row.id}-vd-sa`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M3'),
          cognitiveLevel: 'M3',
          questionType: 'SHORT_ANSWER',
          questionCount: row.vdSa,
          score: Math.round(row.vdSa * 0.5 * 100) / 100,
          description: `Tính toán số liệu hoặc xác định đại lượng vật lí/hóa học/sinh học cụ thể của ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.vdSa)
        });
        globalQuestionNumber += row.vdSa;
      }

      if (row.vdcSa > 0) {
        items.push({
          id: `spec-${row.id}-vdc-sa`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M4'),
          cognitiveLevel: 'M4',
          questionType: 'SHORT_ANSWER',
          questionCount: row.vdcSa,
          score: Math.round(row.vdcSa * 0.5 * 100) / 100,
          description: `Giải quyết bài toán nâng cao, tích hợp số liệu thực tế về ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.vdcSa)
        });
        globalQuestionNumber += row.vdcSa;
      }

      // Process Essay
      if (row.nbEs > 0) {
        items.push({
          id: `spec-${row.id}-nb-es`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M1'),
          cognitiveLevel: 'M1',
          questionType: 'ESSAY',
          questionCount: row.nbEs,
          score: Math.round(row.nbEs * 1.0 * 100) / 100,
          description: `Trình bày có hệ thống khái niệm, quy tắc hoặc cấu tạo trong ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.nbEs)
        });
        globalQuestionNumber += row.nbEs;
      }

      if (row.thEs > 0) {
        items.push({
          id: `spec-${row.id}-th-es`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M2'),
          cognitiveLevel: 'M2',
          questionType: 'ESSAY',
          questionCount: row.thEs,
          score: Math.round(row.thEs * 1.0 * 100) / 100,
          description: `Giải thích cơ chế, so sánh hoặc làm rõ mối quan hệ nguyên nhân - kết quả trong ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.thEs)
        });
        globalQuestionNumber += row.thEs;
      }

      if (row.vdEs > 0) {
        items.push({
          id: `spec-${row.id}-vd-es`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M3'),
          cognitiveLevel: 'M3',
          questionType: 'ESSAY',
          questionCount: row.vdEs,
          score: Math.round(row.vdEs * 1.0 * 100) / 100,
          description: `Vận dụng quy luật vào giải quyết vấn đề thực tiễn hoặc bài toán tổng hợp về ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.vdEs)
        });
        globalQuestionNumber += row.vdEs;
      }

      if (row.vdcEs > 0) {
        items.push({
          id: `spec-${row.id}-vdc-es`,
          stt: stt++,
          matrixRowId: row.id,
          topic: row.topicName,
          contentUnit: row.contentUnit,
          lessonId: row.lessonId,
          learningRequirement: getReqForLevel('M4'),
          cognitiveLevel: 'M4',
          questionType: 'ESSAY',
          questionCount: row.vdcEs,
          score: Math.round(row.vdcEs * 1.0 * 100) / 100,
          description: `Đề xuất giải pháp, thiết kế thí nghiệm hoặc đánh giá tác động khoa học về ${row.contentUnit}.`,
          questionNumbers: this.formatQuestionRange(globalQuestionNumber, row.vdcEs)
        });
        globalQuestionNumber += row.vdcEs;
      }
    });

    return {
      id: `spec-${matrix.id}`,
      matrixId: matrix.id,
      title: `Bản đặc tả ${matrix.title}`,
      grade: matrix.grade,
      semester: matrix.semester,
      schoolYear: matrix.schoolYear,
      durationMinutes: matrix.durationMinutes,
      version: matrix.version,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private static formatQuestionRange(start: number, count: number): string {
    if (count <= 1) return `Câu ${start}`;
    return `Câu ${start} - ${start + count - 1}`;
  }
}
