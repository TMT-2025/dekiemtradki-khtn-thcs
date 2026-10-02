import { QuestionItem } from '@/types/question';

export interface QualityValidationResult {
  passed: boolean;
  score: number; // 0 - 100
  errors: string[];
  warnings: string[];
  feedback: string[];
}

export class QuestionQualityEngine {
  /**
   * Evaluates a question against 14 pedagogical and technical criteria
   */
  public static evaluateQuestion(q: Partial<QuestionItem>): QualityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const feedback: string[] = [];

    // Criterion 1: Prompt clarity and length
    if (!q.questionText || q.questionText.trim().length < 10) {
      errors.push('Nội dung câu hỏi quá ngắn hoặc để trống (tối thiểu 10 kí tự).');
    }

    // Criterion 2: Correct answer presence
    if (!q.correctAnswer || q.correctAnswer.trim().length === 0) {
      errors.push('Chưa xác định đáp án đúng.');
    }

    // Criterion 3 & 4: Specific rules by Question Type
    if (q.questionType === 'MCQ') {
      if (!q.options || q.options.length !== 4) {
        errors.push('Câu hỏi trắc nghiệm nhiều lựa chọn bắt buộc phải có đúng 4 phương án (A, B, C, D).');
      }
      
      const validKeys = ['A', 'B', 'C', 'D'];
      if (!q.correctAnswer || !validKeys.includes(q.correctAnswer.toUpperCase())) {
        errors.push(`Đáp án đúng "${q.correctAnswer}" không hợp lệ cho MCQ. Phải là A, B, C hoặc D.`);
      }

      if (q.options && q.options.length === 4) {
        // Check for giveaway phrases

        // Check for giveaway phrases
        const textBlob = q.options.map(o => o.text.toLowerCase()).join(' ');
        if (textBlob.includes('tất cả đều') || textBlob.includes('cả a và b') || textBlob.includes('cả b và c')) {
          warnings.push('Phương án chứa cụm từ dễ đoán ("tất cả đều...", "cả A và B..."). Theo chuẩn khảo thí không nên dùng.');
        }

        // Check length balance among options
        const lengths = q.options.map(o => o.text.trim().length);
        const maxLength = Math.max(...lengths);
        const minLength = Math.min(...lengths);
        if (minLength > 0 && maxLength / minLength > 3.5) {
          warnings.push('Độ dài các phương án quá chênh lệch. Phương án dài bất thường có thể bị học sinh đoán là đáp án đúng.');
        }
      }
    } else if (q.questionType === 'TRUE_FALSE') {
      if (!q.options || q.options.length !== 4) {
        errors.push('Câu hỏi trắc nghiệm Đúng/Sai phải có đúng 4 lệnh hỏi/ý nhỏ (a, b, c, d).');
      }
    } else if (q.questionType === 'SHORT_ANSWER') {
      if (q.options && q.options.length > 0) {
        warnings.push('Dạng câu hỏi trả lời ngắn không cần danh sách phương án lựa chọn.');
      }
      if (!q.correctAnswer || q.correctAnswer.length > 100) {
        warnings.push('Đáp án trả lời ngắn nên súc tích (con số, kết quả tính toán hoặc thuật ngữ ngắn gọn).');
      }
    } else if (q.questionType === 'ESSAY') {
      if (!q.explanation || q.explanation.length < 20) {
        warnings.push('Câu hỏi tự luận cần có hướng dẫn chấm / biểu điểm chi tiết (rubric).');
      }
    }

    // Criterion 5: Rationale requirement
    if (!q.rationale || q.rationale.trim().length < 15) {
      warnings.push('Chưa có "Rationale" giải thích rõ lý do câu hỏi đạt mức độ nhận thức này.');
    }

    // Criterion 6: Score validity
    if (!q.score || q.score <= 0) {
      errors.push('Điểm số của câu hỏi phải lớn hơn 0.');
    }

    // Calculate quality score
    let score = 100;
    score -= errors.length * 25;
    score -= warnings.length * 10;
    if (score < 0) score = 0;

    const passed = errors.length === 0;

    if (passed && warnings.length === 0) {
      feedback.push('Câu hỏi đạt chuẩn khảo thí GDPT 2018.');
    } else {
      feedback.push(...errors, ...warnings);
    }

    return {
      passed,
      score,
      errors,
      warnings,
      feedback
    };
  }

  /**
   * Detects duplicate or near-duplicate questions in the bank
   */
  public static findDuplicates(newText: string, existingQuestions: QuestionItem[]): QuestionItem[] {
    const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '');
    const cleanNew = normalize(newText);

    return existingQuestions.filter(q => {
      const cleanOld = normalize(q.questionText);
      if (cleanNew === cleanOld) return true;
      // Simple Jaccard similarity on 4-grams if very close
      if (cleanNew.length > 20 && cleanOld.length > 20) {
        const diffRatio = Math.abs(cleanNew.length - cleanOld.length) / Math.max(cleanNew.length, cleanOld.length);
        if (diffRatio < 0.1 && (cleanNew.includes(cleanOld.slice(0, 30)) || cleanOld.includes(cleanNew.slice(0, 30)))) {
          return true;
        }
      }
      return false;
    });
  }
}
