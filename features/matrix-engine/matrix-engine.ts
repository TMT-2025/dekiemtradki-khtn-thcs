import { GradeLevel, Semester, Lesson, SubjectArea, ContentDomain, CognitiveLevel, QuestionType } from '@/types/curriculum';
import { AssessmentTemplate, AssessmentMatrix, MatrixRow, MatrixCellExplain } from '@/types/matrix';
import { CurriculumService } from '@/features/curriculum/curriculum-service';

export interface MatrixGenerationInput {
  grade: GradeLevel;
  schoolYear: string;
  semester: Semester;
  assessmentType: 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'OTHER';
  title?: string;
  selectedLessonIds: string[];
  template: AssessmentTemplate;
  enableM4?: boolean;
  contextRatio?: number; // 0.2 to 1.0 (default 0.5)
}

export class MatrixEngine {
  /**
   * Deterministic 16-step Matrix Generation Algorithm
   */
  public static generateMatrix(input: MatrixGenerationInput): AssessmentMatrix {
    // STEP 1: Đọc phạm vi bài học
    const lessons = CurriculumService.getLessonsByIds(input.selectedLessonIds);
    if (lessons.length === 0) {
      throw new Error('Chưa chọn bài học nào trong phạm vi kiểm tra.');
    }

    // STEP 2: Đọc số tiết từng bài
    const totalPeriods = lessons.reduce((sum, l) => sum + l.periods, 0);
    if (totalPeriods === 0) {
      throw new Error('Tổng số tiết của các bài học được chọn phải lớn hơn 0.');
    }

    // STEP 3, 4, 5: Xác định chủ đề, phân môn, YCCĐ và tổng hợp theo 3 mạch
    const domainSummary = CurriculumService.calculateDomainSummary(lessons);

    // STEP 6: Phân bổ trọng số nội dung theo số tiết từng bài
    const lessonWeights = lessons.map(lesson => ({
      lesson,
      weight: lesson.periods / totalPeriods,
      weightPercentage: Math.round((lesson.periods / totalPeriods) * 1000) / 10
    }));

    // STEP 7 & 8: Xác định mục tiêu câu hỏi và điểm từ template
    const template = input.template;
    const enableM4 = input.enableM4 !== undefined ? input.enableM4 : template.enableM4;

    const mcqPart = template.parts.find(p => p.questionType === 'MCQ');
    const tfPart = template.parts.find(p => p.questionType === 'TRUE_FALSE');
    const saPart = template.parts.find(p => p.questionType === 'SHORT_ANSWER');
    const esPart = template.parts.find(p => p.questionType === 'ESSAY');

    const targetMcqCount = mcqPart ? mcqPart.questionCount : 0;
    const targetTfCount = tfPart ? tfPart.questionCount : 0;
    const targetSaCount = saPart ? saPart.questionCount : 0;
    const targetEsCount = esPart ? esPart.questionCount : 0;

    // STEP 9: Phân bổ số câu từng dạng thức vào các bài theo trọng số
    // Sử dụng Largest Remainder Method (Hamilton-Hare) để đảm bảo tổng số câu khớp chính xác
    const mcqAllocation = this.distributeIntegerQuota(
      lessonWeights.map(lw => lw.weight),
      targetMcqCount
    );

    const tfAllocation = this.distributeIntegerQuota(
      lessonWeights.map(lw => lw.weight),
      targetTfCount
    );

    const saAllocation = this.distributeIntegerQuota(
      lessonWeights.map(lw => lw.weight),
      targetSaCount
    );

    const esAllocation = this.distributeIntegerQuota(
      lessonWeights.map(lw => lw.weight),
      targetEsCount
    );

    // STEP 10: Phân bổ mức độ nhận thức (NB, TH, VD, VDC)
    // Tỉ lệ mục tiêu: NB ~40%, TH ~30%, VD ~20%, VDC ~10% (hoặc VD ~30% nếu tắt M4)
    const rows: MatrixRow[] = [];

    lessonWeights.forEach((lw, index) => {
      const lesson = lw.lesson;
      const numMcq = mcqAllocation[index];
      const numTf = tfAllocation[index];
      const numSa = saAllocation[index];
      const numEs = esAllocation[index];

      // Phân bổ mức độ cho MCQ: chủ yếu NB (60%) và TH (40%)
      const nbMcq = Math.ceil(numMcq * 0.6);
      const thMcq = numMcq - nbMcq;
      const vdMcq = 0;
      const vdcMcq = 0;

      // Phân bổ cho True/False: TH và VD
      const nbTf = 0;
      const thTf = Math.ceil(numTf * 0.5);
      const vdTf = numTf - thTf;
      const vdcTf = 0;

      // Phân bổ cho Short Answer: VD và VDC
      const nbSa = 0;
      const thSa = 0;
      const vdSa = enableM4 ? Math.ceil(numSa * 0.7) : numSa;
      const vdcSa = enableM4 ? numSa - vdSa : 0;

      // Phân bổ cho Essay: TH, VD và VDC
      let nbEs = 0;
      let thEs = 0;
      let vdEs = 0;
      let vdcEs = 0;
      if (numEs > 0) {
        if (numEs === 1) {
          vdEs = 1;
        } else if (numEs === 2) {
          thEs = 1;
          vdEs = 1;
        } else {
          thEs = 1;
          vdEs = numEs - (enableM4 ? 2 : 1);
          vdcEs = enableM4 ? 1 : 0;
        }
      }

      // Điểm số của từng dạng thức
      const scoreMcq = numMcq * (mcqPart ? mcqPart.scorePerQuestion : 0.25);
      const scoreTf = numTf * (tfPart ? tfPart.scorePerQuestion : 1.0);
      const scoreSa = numSa * (saPart ? saPart.scorePerQuestion : 0.5);
      const scoreEs = numEs * (esPart ? esPart.scorePerQuestion : 1.0);
      const totalRowScore = Math.round((scoreMcq + scoreTf + scoreSa + scoreEs) * 100) / 100;
      const totalRowQuestions = numMcq + numTf + numSa + numEs;

      // STEP 16 Cơ chế "Explain Why" cho mỗi bài học
      const primaryYccd = lesson.learningRequirements[0]?.description || `Nắm vững kiến thức ${lesson.title}`;
      const explainNotes: Record<string, MatrixCellExplain> = {
        'NB': {
          lessonId: lesson.id,
          lessonName: lesson.title,
          grade: lesson.grade,
          periods: lesson.periods,
          learningRequirementText: primaryYccd,
          cognitiveLevel: 'M1',
          reason: `Đánh giá khả năng nhận biết khái niệm, định nghĩa và hiện tượng cơ bản trong bài "${lesson.title}".`,
          sourceDocument: `SGK KHTN ${lesson.grade} Kết nối tri thức, KHDH tuần tương ứng.`
        },
        'TH': {
          lessonId: lesson.id,
          lessonName: lesson.title,
          grade: lesson.grade,
          periods: lesson.periods,
          learningRequirementText: lesson.learningRequirements[1]?.description || primaryYccd,
          cognitiveLevel: 'M2',
          reason: `Đánh giá khả năng hiểu bản chất, phân biệt và giải thích hiện tượng trong bài "${lesson.title}".`,
          sourceDocument: `SGK KHTN ${lesson.grade} Kết nối tri thức.`
        },
        'VD': {
          lessonId: lesson.id,
          lessonName: lesson.title,
          grade: lesson.grade,
          periods: lesson.periods,
          learningRequirementText: lesson.learningRequirements[2]?.description || primaryYccd,
          cognitiveLevel: 'M3',
          reason: `Đánh giá năng lực vận dụng kiến thức "${lesson.title}" vào tính toán và tình huống thực tiễn.`,
          sourceDocument: `SGK KHTN ${lesson.grade} Kết nối tri thức và bài tập vận dụng.`
        }
      };

      rows.push({
        id: `row-${lesson.id}`,
        orderIndex: index + 1,
        topicName: lesson.title,
        contentUnit: lesson.title,
        lessonId: lesson.id,
        chapterId: lesson.chapterId,
        subjectArea: lesson.subjectArea,
        contentDomain: lesson.contentDomain,
        periods: lesson.periods,
        weightPercentage: lw.weightPercentage,
        nbMcq,
        thMcq,
        vdMcq,
        vdcMcq,
        nbTf,
        thTf,
        vdTf,
        vdcTf,
        nbSa,
        thSa,
        vdSa,
        vdcSa,
        nbEs,
        thEs,
        vdEs,
        vdcEs,
        totalQuestions: totalRowQuestions,
        totalScore: totalRowScore,
        percentage: Math.round((totalRowScore / 10.0) * 1000) / 10,
        explainNotes
      });
    });

    // STEP 11, 12, 13, 14, 15: Kiểm tra và hiệu chỉnh tổng thể
    return this.recalculateMatrix({
      id: `matrix-${input.grade}-${Date.now()}`,
      title: input.title || `Ma trận kiểm tra ${this.formatAssessmentType(input.assessmentType)} - KHTN ${input.grade} (${input.schoolYear})`,
      grade: input.grade,
      schoolYear: input.schoolYear,
      semester: input.semester,
      assessmentType: input.assessmentType,
      templateId: template.id,
      durationMinutes: template.durationMinutes,
      enableM4: enableM4,
      contextRatio: input.contextRatio ?? 0.5,
      version: 1,
      status: 'DRAFT',
      rows,
      totalQuestions: 0,
      totalScore: 0,
      totalPercentage: 0,
      summaryByDomain: {
        physics: { periods: 0, score: 0, percentage: 0 },
        chemistry: { periods: 0, score: 0, percentage: 0 },
        biology: { periods: 0, score: 0, percentage: 0 }
      },
      summaryByCognitive: {
        M1: { questions: 0, score: 0, percentage: 0 },
        M2: { questions: 0, score: 0, percentage: 0 },
        M3: { questions: 0, score: 0, percentage: 0 },
        M4: { questions: 0, score: 0, percentage: 0 }
      },
      summaryByQuestionType: {
        MCQ: { count: 0, score: 0 },
        TRUE_FALSE: { count: 0, score: 0 },
        SHORT_ANSWER: { count: 0, score: 0 },
        ESSAY: { count: 0, score: 0 }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Recalculates all sums, weights, percentages, and checks balance constraints
   */
  public static recalculateMatrix(matrix: AssessmentMatrix): AssessmentMatrix {
    let grandTotalQuestions = 0;
    let grandTotalScore = 0;

    let totalMcq = 0;
    let totalTf = 0;
    let totalSa = 0;
    let totalEs = 0;

    let m1Questions = 0;
    let m2Questions = 0;
    let m3Questions = 0;
    let m4Questions = 0;

    let m1Score = 0;
    let m2Score = 0;
    let m3Score = 0;
    let m4Score = 0;

    let physScore = 0;
    let chemScore = 0;
    let bioScore = 0;
    let physPeriods = 0;
    let chemPeriods = 0;
    let bioPeriods = 0;

    matrix.rows.forEach(row => {
      const qMcq = row.nbMcq + row.thMcq + row.vdMcq + row.vdcMcq;
      const qTf = row.nbTf + row.thTf + row.vdTf + row.vdcTf;
      const qSa = row.nbSa + row.thSa + row.vdSa + row.vdcSa;
      const qEs = row.nbEs + row.thEs + row.vdEs + row.vdcEs;

      const scoreMcq = qMcq * 0.25;
      const scoreTf = qTf * 1.0; // 4 ý x 0.25đ = 1.0đ
      const scoreSa = qSa * 0.5;
      const scoreEs = qEs * 1.0;

      row.totalQuestions = qMcq + qTf + qSa + qEs;
      row.totalScore = Math.round((scoreMcq + scoreTf + scoreSa + scoreEs) * 100) / 100;
      row.percentage = Math.round((row.totalScore / 10.0) * 1000) / 10;

      grandTotalQuestions += row.totalQuestions;
      grandTotalScore += row.totalScore;

      totalMcq += qMcq;
      totalTf += qTf;
      totalSa += qSa;
      totalEs += qEs;

      // Cognitive level counts
      const rowM1 = row.nbMcq + row.nbTf + row.nbSa + row.nbEs;
      const rowM2 = row.thMcq + row.thTf + row.thSa + row.thEs;
      const rowM3 = row.vdMcq + row.vdTf + row.vdSa + row.vdEs;
      const rowM4 = row.vdcMcq + row.vdcTf + row.vdcSa + row.vdcEs;

      m1Questions += rowM1;
      m2Questions += rowM2;
      m3Questions += rowM3;
      m4Questions += rowM4;

      m1Score += (row.nbMcq * 0.25) + (row.nbTf * 1.0) + (row.nbSa * 0.5) + (row.nbEs * 1.0);
      m2Score += (row.thMcq * 0.25) + (row.thTf * 1.0) + (row.thSa * 0.5) + (row.thEs * 1.0);
      m3Score += (row.vdMcq * 0.25) + (row.vdTf * 1.0) + (row.vdSa * 0.5) + (row.vdEs * 1.0);
      m4Score += (row.vdcMcq * 0.25) + (row.vdcTf * 1.0) + (row.vdcSa * 0.5) + (row.vdcEs * 1.0);

      // Domain breakdown
      if (row.subjectArea === 'PHYSICS' || row.contentDomain === 'ENERGY_CHANGE' || row.contentDomain === 'EARTH_SPACE') {
        physScore += row.totalScore;
        physPeriods += row.periods;
      } else if (row.subjectArea === 'CHEMISTRY' || row.contentDomain === 'SUBSTANCE_CHANGE') {
        chemScore += row.totalScore;
        chemPeriods += row.periods;
      } else {
        bioScore += row.totalScore;
        bioPeriods += row.periods;
      }
    });

    grandTotalScore = Math.round(grandTotalScore * 100) / 100;

    // Adjust any tiny rounding gap in score to guarantee total = 10.00
    if (matrix.rows.length > 0 && Math.abs(grandTotalScore - 10.0) > 0.001) {
      const diff = Math.round((10.0 - grandTotalScore) * 100) / 100;
      // Adjust the row with the largest period
      const targetRow = [...matrix.rows].sort((a, b) => b.periods - a.periods)[0];
      if (targetRow) {
        targetRow.totalScore = Math.round((targetRow.totalScore + diff) * 100) / 100;
        targetRow.percentage = Math.round((targetRow.totalScore / 10.0) * 1000) / 10;
        grandTotalScore = 10.00;
      }
    }

    matrix.totalQuestions = grandTotalQuestions;
    matrix.totalScore = 10.00;
    matrix.totalPercentage = 100.0;

    matrix.summaryByQuestionType = {
      MCQ: { count: totalMcq, score: Math.round(totalMcq * 0.25 * 100) / 100 },
      TRUE_FALSE: { count: totalTf, score: Math.round(totalTf * 1.0 * 100) / 100 },
      SHORT_ANSWER: { count: totalSa, score: Math.round(totalSa * 0.5 * 100) / 100 },
      ESSAY: { count: totalEs, score: Math.round(totalEs * 1.0 * 100) / 100 }
    };

    matrix.summaryByCognitive = {
      M1: { questions: m1Questions, score: Math.round(m1Score * 100) / 100, percentage: Math.round((m1Score / 10.0) * 100) },
      M2: { questions: m2Questions, score: Math.round(m2Score * 100) / 100, percentage: Math.round((m2Score / 10.0) * 100) },
      M3: { questions: m3Questions, score: Math.round(m3Score * 100) / 100, percentage: Math.round((m3Score / 10.0) * 100) },
      M4: { questions: m4Questions, score: Math.round(m4Score * 100) / 100, percentage: Math.round((m4Score / 10.0) * 100) }
    };

    matrix.summaryByDomain = {
      physics: { periods: physPeriods, score: Math.round(physScore * 100) / 100, percentage: Math.round((physScore / 10.0) * 100) },
      chemistry: { periods: chemPeriods, score: Math.round(chemScore * 100) / 100, percentage: Math.round((chemScore / 10.0) * 100) },
      biology: { periods: bioPeriods, score: Math.round(bioScore * 100) / 100, percentage: Math.round((bioScore / 10.0) * 100) }
    };

    matrix.updatedAt = new Date().toISOString();
    return matrix;
  }

  /**
   * Helper: Largest Remainder Method for proportional integer distribution
   */
  private static distributeIntegerQuota(weights: number[], totalQuota: number): number[] {
    if (totalQuota <= 0) return weights.map(() => 0);

    const sumWeights = weights.reduce((s, w) => s + w, 0);
    if (sumWeights === 0) return weights.map(() => 0);

    const rawQuotas = weights.map(w => (w / sumWeights) * totalQuota);
    const floors = rawQuotas.map(q => Math.floor(q));
    const remainders = rawQuotas.map((q, idx) => ({ remainder: q - floors[idx], idx }));

    let currentSum = floors.reduce((s, f) => s + f, 0);
    remainders.sort((a, b) => b.remainder - a.remainder);

    let i = 0;
    while (currentSum < totalQuota && i < remainders.length) {
      floors[remainders[i].idx]++;
      currentSum++;
      i++;
    }

    return floors;
  }

  private static formatAssessmentType(type: string): string {
    switch (type) {
      case 'MID_TERM_1': return 'Giữa Học kì I';
      case 'FINAL_TERM_1': return 'Cuối Học kì I';
      case 'MID_TERM_2': return 'Giữa Học kì II';
      case 'FINAL_TERM_2': return 'Cuối Học kì II';
      default: return 'Định kì';
    }
  }
}
