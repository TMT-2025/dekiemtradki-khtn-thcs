import ExcelJS from 'exceljs';
import { AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { QuestionItem } from '@/types/question';
import { TestExam } from '@/types/test';

export class XlsxExportService {
  /**
   * Ma trận.xlsx
   */
  public static async exportMatrixXlsx(matrix: AssessmentMatrix): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ma trận đề');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Chủ đề / Đơn vị kiến thức', key: 'topic', width: 35 },
      { header: 'Số tiết', key: 'periods', width: 10 },
      { header: 'NB (MCQ)', key: 'nbMcq', width: 10 },
      { header: 'TH (MCQ)', key: 'thMcq', width: 10 },
      { header: 'TH (Đ/S)', key: 'thTf', width: 10 },
      { header: 'VD (Đ/S)', key: 'vdTf', width: 10 },
      { header: 'VD (TLN)', key: 'vdSa', width: 10 },
      { header: 'VDC (TLN)', key: 'vdcSa', width: 10 },
      { header: 'TH (TL)', key: 'thEs', width: 10 },
      { header: 'VD (TL)', key: 'vdEs', width: 10 },
      { header: 'VDC (TL)', key: 'vdcEs', width: 10 },
      { header: 'Tổng số câu', key: 'totalQ', width: 14 },
      { header: 'Điểm số', key: 'totalScore', width: 12 },
      { header: 'Tỉ lệ %', key: 'percentage', width: 10 }
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    matrix.rows.forEach((r, idx) => {
      sheet.addRow({
        stt: idx + 1,
        topic: r.topicName,
        periods: r.periods,
        nbMcq: r.nbMcq || '',
        thMcq: r.thMcq || '',
        thTf: r.thTf || '',
        vdTf: r.vdTf || '',
        vdSa: r.vdSa || '',
        vdcSa: r.vdcSa || '',
        thEs: r.thEs || '',
        vdEs: r.vdEs || '',
        vdcEs: r.vdcEs || '',
        totalQ: r.totalQuestions,
        totalScore: r.totalScore,
        percentage: `${r.percentage}%`
      });
    });

    // Summary Row
    const summaryRow = sheet.addRow({
      stt: 'TỔNG',
      topic: '',
      periods: matrix.rows.reduce((s, r) => s + r.periods, 0),
      totalQ: matrix.totalQuestions,
      totalScore: matrix.totalScore,
      percentage: '100%'
    });
    summaryRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Ngân_hàng_câu_hỏi.xlsx
   */
  public static async exportQuestionBankXlsx(questions: QuestionItem[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ngân hàng câu hỏi');

    sheet.columns = [
      { header: 'Mã câu hỏi', key: 'id', width: 18 },
      { header: 'Lớp', key: 'grade', width: 8 },
      { header: 'Học kì', key: 'semester', width: 10 },
      { header: 'Chủ đề / Bài học', key: 'topic', width: 30 },
      { header: 'Phân môn', key: 'subject', width: 12 },
      { header: 'Mức độ', key: 'level', width: 10 },
      { header: 'Dạng câu', key: 'type', width: 14 },
      { header: 'Nội dung câu hỏi', key: 'text', width: 50 },
      { header: 'Đáp án đúng', key: 'answer', width: 25 },
      { header: 'Điểm', key: 'score', width: 10 },
      { header: 'Lời giải chi tiết', key: 'explanation', width: 40 },
      { header: 'Rationale (Lí do gán mức độ)', key: 'rationale', width: 40 }
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D9488' }
    };

    questions.forEach(q => {
      sheet.addRow({
        id: q.id,
        grade: q.grade,
        semester: q.semester,
        topic: q.topic,
        subject: q.subjectArea,
        level: q.cognitiveLevel,
        type: q.questionType,
        text: q.questionText,
        answer: q.correctAnswer,
        score: q.score,
        explanation: q.explanation,
        rationale: q.rationale
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
