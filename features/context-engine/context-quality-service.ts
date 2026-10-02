import {
  DetailedQualityGateResult,
  ContextQualityCriterionResult,
  QualityCriterionId,
  ContextQualityCheckResult
} from '@/types/context';
import { QuestionItem } from '@/types/question';

export class ContextQualityService {
  /**
   * Run the full 10-criteria Context Quality Gate (QG01 - QG10) according to Section 18 & 19
   */
  public static evaluateQuestion(question: QuestionItem): DetailedQualityGateResult {
    const checks: ContextQualityCriterionResult[] = [];
    const blockingIssues: string[] = [];
    const warnings: string[] = [];
    const meta = question.contextMetadata;

    const lowerText = `${question.questionText} ${question.explanation || ''} ${question.correctAnswer || ''}`.toLowerCase();

    // ----------------------------------------------------
    // QG01: Scientific Accuracy (Blocking)
    // ----------------------------------------------------
    let qg01Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg01Msg = 'Khái niệm, định luật và dữ liệu khoa học chính xác.';
    // Check basic scientific contradictions
    if (lowerText.includes('năng lượng tự sinh ra') || lowerText.includes('khối lượng bị mất đi hoàn toàn')) {
      qg01Status = 'FAIL';
      qg01Msg = 'Vi phạm định luật bảo toàn năng lượng hoặc bảo toàn khối lượng.';
      blockingIssues.push('QG01: ' + qg01Msg);
    }
    checks.push({
      criterionId: 'QG01',
      criterionName: 'Scientific Accuracy',
      status: qg01Status,
      message: qg01Msg
    });

    // ----------------------------------------------------
    // QG02: Curriculum Alignment (Blocking)
    // ----------------------------------------------------
    let qg02Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg02Msg = 'Nội dung bám sát Yêu cầu cần đạt chuẩn GDPT 2018.';
    if (!question.learningRequirementText || question.learningRequirementText.trim().length < 5) {
      qg02Status = 'FAIL';
      qg02Msg = 'Không map được YCCĐ chuẩn CTGDPT 2018.';
      blockingIssues.push('QG02: ' + qg02Msg);
    }
    checks.push({
      criterionId: 'QG02',
      criterionName: 'Curriculum Alignment',
      status: qg02Status,
      message: qg02Msg
    });

    // ----------------------------------------------------
    // QG03: Age Appropriateness (AT04)
    // ----------------------------------------------------
    let qg03Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg03Msg = 'Thuật ngữ và độ phức tạp phù hợp học sinh THCS (11–15 tuổi).';
    const universityJargon = [
      'orbital',
      'entropi',
      'entropy',
      'năng lượng gibbs',
      'gibbs free energy',
      'tích số tan',
      'phương trình schrodinger',
      'hệ số van t hoff',
      'lai hóa sp3',
      'cơ chế sn1',
      'cơ chế sn2'
    ];
    for (const term of universityJargon) {
      if (lowerText.includes(term)) {
        qg03Status = 'FAIL';
        qg03Msg = `Xuất hiện thuật ngữ vượt trình độ THCS / thuật ngữ đại học không phù hợp: "${term}".`;
        warnings.push('QG03: ' + qg03Msg);
        break;
      }
    }
    checks.push({
      criterionId: 'QG03',
      criterionName: 'Age Appropriateness',
      status: qg03Status,
      message: qg03Msg
    });

    // ----------------------------------------------------
    // QG04: Real-world Relevance
    // ----------------------------------------------------
    let qg04Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg04Msg = 'Bối cảnh thực tế gắn kết trực tiếp với đời sống và tự nhiên.';
    if (meta?.hasContext && meta.realWorldRelevance === false) {
      qg04Status = 'WARNING';
      qg04Msg = 'Bối cảnh có dấu hiệu giả định khiên cưỡng.';
      warnings.push('QG04: ' + qg04Msg);
    }
    checks.push({
      criterionId: 'QG04',
      criterionName: 'Real-world Relevance',
      status: qg04Status,
      message: qg04Msg
    });

    // ----------------------------------------------------
    // QG05: Context Necessity (Remove Context Test - Blocking, Section 5 & AT08)
    // ----------------------------------------------------
    let qg05Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg05Msg = 'Bối cảnh có vai trò nhận thức thực chất (Context Must Matter).';
    if (meta?.hasContext) {
      const qText = question.questionText.toLowerCase();
      const hasDirectContextInteraction =
        qText.includes('dựa vào') ||
        qText.includes('theo bảng') ||
        qText.includes('theo biểu đồ') ||
        qText.includes('trong thí nghiệm') ||
        qText.includes('hiện tượng') ||
        qText.includes('ở tình huống') ||
        qText.includes('dữ liệu') ||
        qText.includes('trên đây') ||
        qText.includes('vì sao') ||
        qText.includes('kết luận') ||
        qText.includes('giải thích') ||
        meta.stimulus !== undefined;

      // If question is pure recall (M1/NB) and does not interact with context at all
      if (!hasDirectContextInteraction && (question.cognitiveLevel as any) !== 'M1' && (question.cognitiveLevel as any) !== 'NB') {
        qg05Status = 'FAIL';
        qg05Msg = 'FAIL: CONTEXT_NOT_NECESSARY. Khi bỏ bối cảnh, câu hỏi vẫn trả lời được mà không cần dữ liệu bối cảnh (Bối cảnh trang trí).';
        blockingIssues.push('QG05: ' + qg05Msg);
      }
    }
    checks.push({
      criterionId: 'QG05',
      criterionName: 'Context Necessity (Remove Context Test)',
      status: qg05Status,
      message: qg05Msg
    });

    // ----------------------------------------------------
    // QG06: Data Validity & Synthetic Labeling (AT09)
    // ----------------------------------------------------
    let qg06Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg06Msg = 'Dữ liệu đo đạc, bảng số liệu hợp lệ.';
    if (meta?.stimulus?.type === 'TABLE' && (!meta.stimulus.dataRows || meta.stimulus.dataRows.length === 0)) {
      qg06Status = 'FAIL';
      qg06Msg = 'Bảng số liệu không có dòng dữ liệu hợp lệ.';
      warnings.push('QG06: ' + qg06Msg);
    }
    if (meta?.isSyntheticData && !lowerText.includes('mô phỏng') && !meta.adaptationNote?.includes('mô phỏng')) {
      qg06Status = 'WARNING';
      qg06Msg = 'Dữ liệu mô phỏng cần được gắn nhãn minh bạch theo AT09.';
      warnings.push('QG06: ' + qg06Msg);
    }
    checks.push({
      criterionId: 'QG06',
      criterionName: 'Data Validity',
      status: qg06Status,
      message: qg06Msg
    });

    // ----------------------------------------------------
    // QG07: Language Clarity & Reading Load
    // ----------------------------------------------------
    let qg07Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg07Msg = 'Lời dẫn tường minh, lượng đọc (reading load) phù hợp.';
    if (question.questionText.trim().length < 10) {
      qg07Status = 'FAIL';
      qg07Msg = 'Lời dẫn câu hỏi quá ngắn hoặc thiếu mệnh đề.';
      warnings.push('QG07: ' + qg07Msg);
    } else if (question.questionText.length > 800) {
      qg07Status = 'WARNING';
      qg07Msg = 'Đoạn văn dẫn quá dài so với thời gian làm bài của học sinh THCS.';
      warnings.push('QG07: ' + qg07Msg);
    }
    checks.push({
      criterionId: 'QG07',
      criterionName: 'Language Clarity',
      status: qg07Status,
      message: qg07Msg
    });

    // ----------------------------------------------------
    // QG08: Cultural Appropriateness & Metric Units (AT05)
    // ----------------------------------------------------
    let qg08Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg08Msg = 'Sử dụng hệ đơn vị đo lường SI chuẩn hóa cho Việt Nam (m, cm, g, kg, L, °C).';
    const nonMetricUnits = ['fahrenheit', '°f', 'pounds', 'gallon', 'miles', 'dặm'];
    for (const unit of nonMetricUnits) {
      if (lowerText.includes(unit)) {
        qg08Status = 'FAIL';
        qg08Msg = `Sử dụng đơn vị đo không chuẩn hóa cho Việt Nam: "${unit}". Phải chuẩn hóa sang hệ SI.`;
        warnings.push('QG08: ' + qg08Msg);
        break;
      }
    }
    checks.push({
      criterionId: 'QG08',
      criterionName: 'Cultural Appropriateness',
      status: qg08Status,
      message: qg08Msg
    });

    // ----------------------------------------------------
    // QG09: Cognitive Match
    // ----------------------------------------------------
    let qg09Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg09Msg = `Mức độ nhận thức được phân loại rõ ràng (${question.cognitiveLevel}).`;
    const validLevels = ['M1', 'M2', 'M3', 'M4', 'M1_NB', 'M2_TH', 'M3_VD', 'M4_VDC', 'NB', 'TH', 'VD', 'VDC'];
    if (!validLevels.includes(question.cognitiveLevel as any)) {
      qg09Status = 'FAIL';
      qg09Msg = `Mức độ nhận thức không hợp lệ: "${question.cognitiveLevel}".`;
      warnings.push('QG09: ' + qg09Msg);
    }
    checks.push({
      criterionId: 'QG09',
      criterionName: 'Cognitive Match',
      status: qg09Status,
      message: qg09Msg
    });

    // ----------------------------------------------------
    // QG10: Source Reliability (Blocking, Section 11 & AT10)
    // ----------------------------------------------------
    let qg10Status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let qg10Msg = 'Nguồn gốc tài liệu minh bạch, đáng tin cậy.';
    if (meta?.sourceType === 'DIRECT_SOURCE') {
      if (!meta.sourceUrl && !meta.sourceTitle) {
        qg10Status = 'FAIL';
        qg10Msg = 'Nguồn trực tiếp (DIRECT_SOURCE) nhưng thiếu URL và trích dẫn tổ chức ban hành.';
        blockingIssues.push('QG10: ' + qg10Msg);
      }
    }
    checks.push({
      criterionId: 'QG10',
      criterionName: 'Source Reliability',
      status: qg10Status,
      message: qg10Msg
    });

    // Determine overall status
    const hasFail = checks.some(c => c.status === 'FAIL');
    const hasWarning = checks.some(c => c.status === 'WARNING');
    const passedCriteriaCount = checks.filter(c => c.status === 'PASS').length;
    const score = Math.round((passedCriteriaCount / 10) * 100);

    const overallStatus: 'PASS' | 'FAIL' | 'WARNING' =
      blockingIssues.length > 0 || hasFail ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS';

    return {
      status: overallStatus,
      score,
      checks,
      blockingIssues,
      warnings,
      reviewedAt: new Date().toISOString(),
      passed: overallStatus === 'PASS' || overallStatus === 'WARNING'
    };
  }

  /**
   * Backward compatible check adapter
   */
  public static validateLegacy(question: QuestionItem): ContextQualityCheckResult {
    const detailed = this.evaluateQuestion(question);
    const issues = [...detailed.blockingIssues, ...detailed.warnings];

    const getCriterionPassed = (id: QualityCriterionId) => {
      const c = detailed.checks.find(ch => ch.criterionId === id);
      return c ? c.status !== 'FAIL' : true;
    };

    return {
      scientificAccuracy: getCriterionPassed('QG01'),
      curriculumAlignment: getCriterionPassed('QG02'),
      ageAppropriateness: getCriterionPassed('QG03'),
      realWorldRelevance: getCriterionPassed('QG04'),
      contextNecessity: getCriterionPassed('QG05'),
      dataValidity: getCriterionPassed('QG06'),
      languageClarity: getCriterionPassed('QG07'),
      culturalAppropriateness: getCriterionPassed('QG08'),
      cognitiveAppropriateness: getCriterionPassed('QG09'),
      sourceReliability: getCriterionPassed('QG10'),
      score: detailed.score / 10,
      passed: detailed.passed,
      issues,
      detailed
    };
  }
}
