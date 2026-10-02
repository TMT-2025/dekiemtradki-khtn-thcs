import { AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { TestExam } from '@/types/test';
import { QualityGateResult, QualityIssue } from '@/types/quality';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { ContextService } from '@/features/context-engine/context-service';

export class QualityGate {
  /**
   * Complete End-to-End Chain Consistency Validation
   * YCCĐ -> Ma trận -> Bản đặc tả -> Câu hỏi -> Đề -> Đáp án -> Hướng dẫn chấm
   */
  public static validateChain(params: {
    matrix: AssessmentMatrix;
    specification?: TestSpecification;
    test?: TestExam;
  }): QualityGateResult {
    const issues: QualityIssue[] = [];

    // ==========================================
    // STAGE 1: MATRIX VALIDATION
    // ==========================================
    const matrix = params.matrix;

    // Rule 1.1: Total score must be exactly 10.0
    if (Math.abs(matrix.totalScore - 10.0) > 0.01) {
      issues.push({
        code: 'ERR_MATRIX_SCORE_SUM',
        severity: 'ERROR',
        stage: 'MATRIX',
        message: `Tổng điểm ma trận là ${matrix.totalScore}đ, không khớp quy chuẩn bắt buộc 10.0đ.`,
        expectedValue: 10.0,
        actualValue: matrix.totalScore,
        suggestion: 'Kiểm tra lại số điểm ở các hàng hoặc chạy lại thuật toán tự động cân đối.'
      });
    }

    // Rule 1.2: Total percentage must be 100%
    if (Math.abs(matrix.totalPercentage - 100.0) > 0.1) {
      issues.push({
        code: 'ERR_MATRIX_PERCENTAGE_SUM',
        severity: 'ERROR',
        stage: 'MATRIX',
        message: `Tổng tỉ lệ phần trăm ma trận là ${matrix.totalPercentage}%, không bằng 100%.`,
        expectedValue: 100,
        actualValue: matrix.totalPercentage
      });
    }

    // Rule 1.3: Total questions must be greater than 0
    if (matrix.totalQuestions <= 0) {
      issues.push({
        code: 'ERR_MATRIX_ZERO_QUESTIONS',
        severity: 'ERROR',
        stage: 'MATRIX',
        message: 'Ma trận chưa có câu hỏi nào được phân bổ.'
      });
    }

    // Rule 1.4: Check balance between 3 subject domains
    const rowLessons = CurriculumService.getLessonsByIds(matrix.rows.map(r => r.lessonId));
    const domainSummary = CurriculumService.calculateDomainSummary(rowLessons);

    if (domainSummary.physics.periods > 0 && matrix.summaryByDomain.physics.score === 0) {
      issues.push({
        code: 'WARN_DOMAIN_IMBALANCE_PHYSICS',
        severity: 'WARNING',
        stage: 'MATRIX',
        message: `Phạm vi có ${domainSummary.physics.periods} tiết Vật lí nhưng chưa được phân bổ điểm nào trong ma trận.`,
        suggestion: 'Bổ sung câu hỏi mạch Năng lượng & Trái Đất để đảm bảo tính cân đối liên môn.'
      });
    }

    if (domainSummary.chemistry.periods > 0 && matrix.summaryByDomain.chemistry.score === 0) {
      issues.push({
        code: 'WARN_DOMAIN_IMBALANCE_CHEMISTRY',
        severity: 'WARNING',
        stage: 'MATRIX',
        message: `Phạm vi có ${domainSummary.chemistry.periods} tiết Hóa học nhưng chưa được phân bổ điểm nào trong ma trận.`,
        suggestion: 'Bổ sung câu hỏi mạch Chất và sự biến đổi.'
      });
    }

    if (domainSummary.biology.periods > 0 && matrix.summaryByDomain.biology.score === 0) {
      issues.push({
        code: 'WARN_DOMAIN_IMBALANCE_BIOLOGY',
        severity: 'WARNING',
        stage: 'MATRIX',
        message: `Phạm vi có ${domainSummary.biology.periods} tiết Sinh học nhưng chưa được phân bổ điểm nào trong ma trận.`,
        suggestion: 'Bổ sung câu hỏi mạch Vật sống.'
      });
    }

    // ==========================================
    // STAGE 2: SPECIFICATION VALIDATION
    // ==========================================
    if (params.specification) {
      const spec = params.specification;

      // Rule 2.1: Spec total questions must match matrix total questions
      const specTotalQuestions = spec.items.reduce((s, it) => s + it.questionCount, 0);
      if (specTotalQuestions !== matrix.totalQuestions) {
        issues.push({
          code: 'ERR_SPEC_MATRIX_QUESTION_MISMATCH',
          severity: 'ERROR',
          stage: 'SPECIFICATION',
          message: `Số câu trong bản đặc tả (${specTotalQuestions}) không khớp với ma trận (${matrix.totalQuestions}).`,
          expectedValue: matrix.totalQuestions,
          actualValue: specTotalQuestions
        });
      }

      // Rule 2.2: Spec total score must match matrix total score
      const specTotalScore = Math.round(spec.items.reduce((s, it) => s + it.score, 0) * 100) / 100;
      if (Math.abs(specTotalScore - matrix.totalScore) > 0.01) {
        issues.push({
          code: 'ERR_SPEC_MATRIX_SCORE_MISMATCH',
          severity: 'ERROR',
          stage: 'SPECIFICATION',
          message: `Tổng điểm trong bản đặc tả (${specTotalScore}đ) không khớp với ma trận (${matrix.totalScore}đ).`,
          expectedValue: matrix.totalScore,
          actualValue: specTotalScore
        });
      }

      // Rule 2.3: Each item must have valid pedagogical description
      spec.items.forEach(it => {
        if (!it.description || it.description.trim().length < 5) {
          issues.push({
            code: 'WARN_SPEC_EMPTY_DESCRIPTION',
            severity: 'WARNING',
            stage: 'SPECIFICATION',
            message: `Mục đặc tả "${it.topic}" thiếu mô tả yêu cầu hành vi câu hỏi.`
          });
        }
      });
    }

    // ==========================================
    // STAGE 3: TEST & ANSWER KEY VALIDATION
    // ==========================================
    if (params.test) {
      const test = params.test;

      // Rule 3.1: Test total score must be 10.0
      const testTotalScore = Math.round(
        test.parts.reduce((sum, p) => sum + p.totalScore, 0) * 100
      ) / 100;

      if (Math.abs(testTotalScore - 10.0) > 0.01) {
        issues.push({
          code: 'ERR_TEST_SCORE_SUM',
          severity: 'ERROR',
          stage: 'TEST',
          message: `Tổng điểm các phần của đề kiểm tra là ${testTotalScore}đ, không bằng 10.0đ.`,
          expectedValue: 10.0,
          actualValue: testTotalScore
        });
      }

      // Rule 3.2: Every question must have an answer key entry
      const totalTestQuestions = test.parts.reduce((s, p) => s + p.questions.length, 0);
      if (test.answerKeys.length !== totalTestQuestions) {
        issues.push({
          code: 'ERR_ANSWER_KEY_COUNT_MISMATCH',
          severity: 'ERROR',
          stage: 'ANSWER_KEY',
          message: `Đề có ${totalTestQuestions} câu hỏi nhưng đáp án chỉ có ${test.answerKeys.length} câu.`,
          expectedValue: totalTestQuestions,
          actualValue: test.answerKeys.length
        });
      }

      // Rule 3.3: Every essay question must have rubric entry
      const essayQuestions = test.parts
        .flatMap(p => p.questions)
        .filter(q => q.question.questionType === 'ESSAY');
      
      if (essayQuestions.length > 0 && test.scoringGuide.rubrics.length < essayQuestions.length) {
        issues.push({
          code: 'WARN_SCORING_RUBRIC_INCOMPLETE',
          severity: 'WARNING',
          stage: 'ANSWER_KEY',
          message: `Đề có ${essayQuestions.length} câu tự luận nhưng hướng dẫn chấm chỉ có ${test.scoringGuide.rubrics.length} tiêu chí biểu điểm.`
        });
      }

      // ==========================================
      // STAGE 4: CONTEXT-BASED ASSESSMENT INTEGRITY
      // ==========================================
      if (test.contextReport) {
        const cr = test.contextReport;

        // Rule 4.1: Target context ratio check
        if (cr.qualityStatus === 'WARNING' || cr.qualityStatus === 'FAIL') {
          cr.feedbackNotes.forEach((note, idx) => {
            issues.push({
              code: `WARN_CONTEXT_RATIO_${idx}`,
              severity: cr.qualityStatus === 'FAIL' ? 'ERROR' : 'WARNING',
              stage: 'CONTEXT',
              message: note,
              expectedValue: `${cr.targetContextPercentage}%`,
              actualValue: `${cr.contextPercentage}%`,
              suggestion: 'Điều chỉnh cấu hình hoặc sử dụng Thư viện bối cảnh để bổ sung câu hỏi thực tiễn.'
            });
          });
        }

        // Rule 4.2: Individual context question quality check (10 criteria)
        test.parts.forEach(part => {
          part.questions.forEach(tq => {
            if (tq.question.contextMetadata?.hasContext) {
              const res = ContextService.validateContextQuality(tq.question);
              if (!res.passed) {
                issues.push({
                  code: 'WARN_CONTEXT_CRITERIA_FAILED',
                  severity: 'WARNING',
                  stage: 'CONTEXT',
                  location: `Câu ${tq.globalOrderIndex}`,
                  message: `Câu hỏi bối cảnh "${tq.question.contextMetadata.phenomenon || tq.question.id}" chưa đạt chuẩn: ${res.issues.join('; ')}`,
                  suggestion: 'Kiểm tra tính cần thiết của bối cảnh (Context Must Matter) và thuật ngữ phù hợp lứa tuổi.'
                });
              }
            }
          });
        });
      }
    }

    const totalErrors = issues.filter(i => i.severity === 'ERROR').length;
    const totalWarnings = issues.filter(i => i.severity === 'WARNING').length;

    let score = 100 - (totalErrors * 30) - (totalWarnings * 10);
    if (score < 0) score = 0;

    return {
      passed: totalErrors === 0,
      score,
      totalErrors,
      totalWarnings,
      issues,
      checkedAt: new Date().toISOString()
    };
  }
}
