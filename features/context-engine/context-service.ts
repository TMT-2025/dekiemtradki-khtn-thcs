import fs from 'fs';
import path from 'path';
import { GradeLevel, SubjectArea, ContentDomain, CognitiveLevel, QuestionType } from '@/types/curriculum';
import {
  PhenomenonItem,
  InternationalContextItem,
  ContextScope,
  ApplicationDomain,
  ContextComplexity,
  ContextQualityCheckResult,
  DetailedQualityGateResult,
  ContextReport,
  ContextMetadata,
  StimulusContent,
  Stimulus
} from '@/types/context';
import { QuestionItem } from '@/types/question';
import { ContextQualityService } from './context-quality-service';
import { DiversityService } from './diversity-service';
import { TraceService } from './trace-service';
import { StimulusService } from './stimulus-service';
import { ContextRulesService } from './context-rules-service';

export class ContextService {
  private static phenomenaCache: PhenomenonItem[] | null = null;
  private static intlCache: InternationalContextItem[] | null = null;

  public static getPhenomena(): PhenomenonItem[] {
    if (!this.phenomenaCache) {
      try {
        const filePath = path.join(process.cwd(), 'database', 'phenomenon-library.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.phenomenaCache = JSON.parse(raw);
        } else {
          this.phenomenaCache = [];
        }
      } catch (err) {
        console.error('Error loading phenomenon-library.json:', err);
        this.phenomenaCache = [];
      }
    }
    return this.phenomenaCache || [];
  }

  public static getInternationalContexts(): InternationalContextItem[] {
    if (!this.intlCache) {
      try {
        const filePath = path.join(process.cwd(), 'database', 'international-contexts.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.intlCache = JSON.parse(raw);
        } else {
          this.intlCache = [];
        }
      } catch (err) {
        console.error('Error loading international-contexts.json:', err);
        this.intlCache = [];
      }
    }
    return this.intlCache || [];
  }

  private static stimuliCache: Stimulus[] | null = null;

  public static getStimuli(): Stimulus[] {
    if (!this.stimuliCache) {
      try {
        const filePath = path.join(process.cwd(), 'database', 'context-stimuli.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.stimuliCache = JSON.parse(raw);
        } else {
          this.stimuliCache = [];
        }
      } catch (err) {
        console.error('Error loading context-stimuli.json:', err);
        this.stimuliCache = [];
      }
    }
    return this.stimuliCache || [];
  }

  public static getStimulusById(id: string): Stimulus | undefined {
    return this.getStimuli().find(s => s.id === id || s.contextId === id);
  }

  public static saveStimulus(stim: Stimulus): void {
    const list = this.getStimuli();
    const idx = list.findIndex(s => s.id === stim.id);
    if (idx >= 0) {
      list[idx] = stim;
    } else {
      list.push(stim);
    }
    this.stimuliCache = list;
    try {
      const filePath = path.join(process.cwd(), 'database', 'context-stimuli.json');
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving context-stimuli.json:', err);
    }
  }

  public static deleteStimulus(id: string): boolean {
    const list = this.getStimuli();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length !== list.length) {
      this.stimuliCache = filtered;
      try {
        const filePath = path.join(process.cwd(), 'database', 'context-stimuli.json');
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
      } catch (err) {
        console.error('Error saving context-stimuli.json:', err);
      }
    }
    return false;
  }

  public static getPhenomenonById(id: string): PhenomenonItem | undefined {
    return this.getPhenomena().find(p => p.phenomenon_id === id || p.id === id);
  }

  public static savePhenomenon(p: PhenomenonItem): void {
    const list = this.getPhenomena();
    const idx = list.findIndex(item => item.phenomenon_id === p.phenomenon_id);
    if (idx >= 0) {
      list[idx] = p;
    } else {
      list.push(p);
    }
    this.phenomenaCache = list;
    try {
      const filePath = path.join(process.cwd(), 'database', 'phenomenon-library.json');
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving phenomenon-library.json:', err);
    }
  }

  public static updatePhenomenon(id: string, data: Partial<PhenomenonItem>): PhenomenonItem | undefined {
    const p = this.getPhenomenonById(id);
    if (!p) return undefined;
    const updated = { ...p, ...data };
    this.savePhenomenon(updated);
    return updated;
  }

  public static deletePhenomenon(id: string): boolean {
    const list = this.getPhenomena();
    const filtered = list.filter(p => p.phenomenon_id !== id && p.id !== id);
    if (filtered.length !== list.length) {
      this.phenomenaCache = filtered;
      try {
        const filePath = path.join(process.cwd(), 'database', 'phenomenon-library.json');
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
      } catch (err) {
        console.error('Error saving phenomenon-library.json:', err);
      }
    }
    return false;
  }

  public static filterPhenomena(filter: {
    grade?: GradeLevel;
    subjectArea?: SubjectArea;
    contentDomain?: ContentDomain;
    contextType?: ContextScope;
    applicationArea?: ApplicationDomain;
    contextLevel?: ContextComplexity;
    keyword?: string;
  }): PhenomenonItem[] {
    let list = this.getPhenomena();
    if (filter.grade) list = list.filter(p => p.grade === filter.grade);
    if (filter.subjectArea) list = list.filter(p => p.subject_area === filter.subjectArea);
    if (filter.contentDomain) list = list.filter(p => p.content_domain === filter.contentDomain);
    if (filter.contextType) list = list.filter(p => p.context_type === filter.contextType);
    if (filter.applicationArea) list = list.filter(p => p.application_area === filter.applicationArea);
    if (filter.contextLevel) list = list.filter(p => p.context_level === filter.contextLevel);
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw) ||
        p.topic.toLowerCase().includes(kw)
      );
    }
    return list;
  }

  public static filterInternationalContexts(filter: {
    grade?: GradeLevel;
    applicationArea?: ApplicationDomain;
    contextType?: ContextScope;
    contextLevel?: ContextComplexity;
    organization?: string;
    keyword?: string;
  }): InternationalContextItem[] {
    let list = this.getInternationalContexts();
    if (filter.grade) list = list.filter(c => c.grade === filter.grade);
    if (filter.applicationArea) list = list.filter(c => c.application_area === filter.applicationArea);
    if (filter.contextType) list = list.filter(c => c.context_type === filter.contextType);
    if (filter.contextLevel) list = list.filter(c => c.context_level === filter.contextLevel);
    if (filter.organization) {
      const org = filter.organization.toLowerCase();
      list = list.filter(c => c.organization.toLowerCase().includes(org));
    }
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(kw) ||
        c.description.toLowerCase().includes(kw) ||
        c.adapted_context.toLowerCase().includes(kw)
      );
    }
    return list;
  }

  /**
   * Section 18 & 19: Context Quality Gate evaluation
   */
  public static validateContextQuality(question: QuestionItem): ContextQualityCheckResult {
    return ContextQualityService.validateLegacy(question);
  }

  public static evaluateDetailedQuality(question: QuestionItem): DetailedQualityGateResult {
    return ContextQualityService.evaluateQuestion(question);
  }

  /**
   * Section 21, 30, 40 & LXXV: Context Report and Diversity Generator
   */
  public static generateContextReport(questions: QuestionItem[], targetRatio: number = 0.5): ContextReport {
    const totalQuestions = questions.length;
    const contextQuestions = questions.filter(q => q.contextMetadata?.hasContext).length;
    const nonContextQuestions = totalQuestions - contextQuestions;
    const contextPercentage = totalQuestions > 0 ? Math.round((contextQuestions / totalQuestions) * 100) : 0;
    const targetContextPercentage = Math.round(targetRatio * 100);

    const breakdownByArea: Record<string, number> = {};
    const breakdownByLevel: Record<string, number> = {
      M1: 0,
      M2: 0,
      M3: 0,
      M4: 0
    };
    const breakdownByComplexity: Record<string, number> = {
      C1: 0,
      C2: 0,
      C3: 0,
      C4: 0
    };

    questions.forEach(q => {
      if (q.contextMetadata?.hasContext) {
        const area = q.contextMetadata.applicationArea || 'DAILY_LIFE';
        breakdownByArea[area] = (breakdownByArea[area] || 0) + 1;

        const lvlKey = (q.cognitiveLevel === ('NB' as any) ? 'M1' : q.cognitiveLevel === ('TH' as any) ? 'M2' : q.cognitiveLevel === ('VD' as any) ? 'M3' : q.cognitiveLevel === ('VDC' as any) ? 'M4' : q.cognitiveLevel) as string;
        if (breakdownByLevel[lvlKey] !== undefined) {
          breakdownByLevel[lvlKey]++;
        }

        const lvl = q.contextMetadata.contextLevel || 'C1';
        if (breakdownByComplexity[lvl] !== undefined) {
          breakdownByComplexity[lvl]++;
        }
      }
    });

    const feedbackNotes: string[] = [];
    let qualityStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    // Check ratio deviation (tolerance +/- 25%)
    const diff = Math.abs(contextPercentage - targetContextPercentage);
    if (diff > 25) {
      qualityStatus = 'WARNING';
      feedbackNotes.push(`Tỉ lệ câu hỏi có bối cảnh (${contextPercentage}%) chênh lệch so với mục tiêu (${targetContextPercentage}%).`);
    }

    if (contextQuestions === 0 && targetRatio > 0.3) {
      qualityStatus = 'FAIL';
      feedbackNotes.push('Đề thi chưa có câu hỏi gắn với bối cảnh thực tiễn theo yêu cầu ma trận.');
    }

    // Section 30: Calculate Diversity Report
    const diversityReport = DiversityService.calculateDiversity(questions);
    diversityReport.diversityWarnings.forEach(w => {
      if (!feedbackNotes.includes(w)) {
        feedbackNotes.push(w);
        if (qualityStatus === 'PASS') qualityStatus = 'WARNING';
      }
    });

    // Section 21: Cross analysis
    const crossAnalysis = DiversityService.calculateCrossAnalysis(questions);

    return {
      totalQuestions,
      contextQuestions,
      nonContextQuestions,
      contextPercentage,
      targetContextPercentage,
      breakdownByArea,
      breakdownByLevel,
      breakdownByComplexity,
      crossAnalysis,
      diversityReport,
      qualityStatus,
      feedbackNotes
    };
  }

  /**
   * Section 16 & 24: CONTEXT-FIRST QUESTION GENERATOR (Workflow B)
   */
  public static buildQuestionFromPhenomenon(
    phenomenon: PhenomenonItem,
    cognitiveLevel: CognitiveLevel,
    questionType: QuestionType,
    learningRequirementText: string
  ): QuestionItem {
    const id = `Q_CTX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const isMcq = questionType === 'MCQ';
    const isTf = questionType === 'TRUE_FALSE';
    const isSa = questionType === 'SHORT_ANSWER';
    const isEssay = questionType === 'ESSAY';

    let questionText = '';
    let correctAnswer = '';
    let explanation = '';
    let rationale = '';
    let options = undefined;

    const stimulus = phenomenon.stimulus;
    const stimulusLead = stimulus ? `\n[Bối cảnh & Dữ liệu]: ${stimulus.title}\n${stimulus.leadParagraph}\n` : '';

    if (isMcq) {
      if (cognitiveLevel === 'M1' || (cognitiveLevel as any) === 'NB') {
        questionText = `${stimulusLead}Dựa trên hiện tượng "${phenomenon.title}", yếu tố nào sau đây là nguyên nhân trực tiếp dẫn đến hiện tượng trên?`;
        options = [
          { key: 'A', text: 'Sự chênh lệch về nồng độ hoặc tính chất vật lí giữa các chất.', isCorrect: true },
          { key: 'B', text: 'Sự thay đổi áp suất khí quyển đột ngột trong không gian kín.', isCorrect: false },
          { key: 'C', text: 'Nhiệt độ môi trường luôn được duy trì ở 100°C liên tục.', isCorrect: false },
          { key: 'D', text: 'Chỉ xảy ra phản ứng trao đổi ion mà không có sự tỏa nhiệt.', isCorrect: false }
        ];
        correctAnswer = 'A';
        explanation = `Theo kiến thức bài học về ${phenomenon.topic}, hiện tượng xảy ra do bản chất hóa học/vật lí của các chất tham gia.`;
      } else if (cognitiveLevel === 'M2' || (cognitiveLevel as any) === 'TH') {
        questionText = `${stimulusLead}Học sinh giải thích cơ chế của hiện tượng "${phenomenon.title}" như thế nào là đúng đắn về mặt khoa học?`;
        options = [
          { key: 'A', text: 'Do các phân tử chất tan làm biến đổi liên kết phân tử và tính chất của dung môi.', isCorrect: true },
          { key: 'B', text: 'Do khối lượng của các hạt cơ bản bên trong nguyên tử bị phá hủy.', isCorrect: false },
          { key: 'C', text: 'Do năng lượng toàn phần của hệ thống không được bảo toàn.', isCorrect: false },
          { key: 'D', text: 'Do quá trình chỉ xảy ra khi có chất xúc tác acid mạnh.', isCorrect: false }
        ];
        correctAnswer = 'A';
        explanation = `Hiện tượng được giải thích dựa trên quy luật tương tác giữa các chất và sự chuyển hóa năng lượng.`;
      } else {
        questionText = `${stimulusLead}Dựa trên các dữ liệu thực nghiệm đã cho, hãy dự đoán kết quả hoặc đề xuất giải pháp xử lí vấn đề phù hợp nhất:`;
        options = [
          { key: 'A', text: 'Điều chỉnh nồng độ hoặc điều kiện nhiệt độ/áp suất theo quy luật thực nghiệm đã quan sát.', isCorrect: true },
          { key: 'B', text: 'Tăng thể tích dung dịch lên gấp 10 lần mà không cần thay đổi nhiệt độ.', isCorrect: false },
          { key: 'C', text: 'Ngừng cung cấp nguồn năng lượng khi phản ứng đang ở giai đoạn hấp thụ nhiệt.', isCorrect: false },
          { key: 'D', text: 'Thay thế hoàn toàn bằng chất không có khả năng tham gia phản ứng.', isCorrect: false }
        ];
        correctAnswer = 'A';
        explanation = `Vận dụng quy luật rút ra từ dữ liệu để đưa ra quyết định khoa học chính xác.`;
      }
      rationale = `Đánh giá mức độ ${cognitiveLevel} thông qua bối cảnh ${phenomenon.application_area} (${phenomenon.title}). Bối cảnh có ý nghĩa quyết định đối với việc chọn đáp án.`;
    } else if (isTf) {
      questionText = `${stimulusLead}Khi phân tích hiện tượng và dữ liệu thực nghiệm trên, mỗi nhận định sau đây là Đúng hay Sai?`;
      options = [
        { key: 'a', text: 'Dữ liệu thực nghiệm phản ánh đúng quy luật biến đổi trong tự nhiên.', isCorrect: true },
        { key: 'b', text: 'Nếu giữ nguyên các điều kiện đối chứng, kết quả đo sẽ không thay đổi đáng kể.', isCorrect: true },
        { key: 'c', text: 'Biến độc lập trong thí nghiệm này là yếu tố không thể chủ động điều chỉnh.', isCorrect: false },
        { key: 'd', text: 'Kết quả thu được có thể ứng dụng trực tiếp để giải quyết tình huống thực tế tại địa phương.', isCorrect: true }
      ];
      correctAnswer = 'a:Đ, b:Đ, c:S, d:Đ';
      explanation = 'Ý c sai vì biến độc lập là yếu tố mà người nghiên cứu chủ động thay đổi để quan sát ảnh hưởng lên biến phụ thuộc.';
      rationale = `Đánh giá năng lực phân tích dữ liệu thực nghiệm và phương pháp nghiên cứu khoa học ở mức độ ${cognitiveLevel}.`;
    } else if (isSa) {
      questionText = `${stimulusLead}Từ bảng số liệu/thí nghiệm trên, hãy xác định giá trị đo hoặc đại lượng đặc trưng tương ứng tại điều kiện tối ưu (chỉ điền số hoặc thuật ngữ chính xác):`;
      correctAnswer = 'Giá trị đo tối ưu';
      explanation = 'Dựa vào bước nhảy dữ liệu trong bảng/biểu đồ để xác định giá trị chính xác.';
      rationale = `Yêu cầu học sinh trích xuất thông tin định lượng trực tiếp từ bối cảnh dữ liệu.`;
    } else {
      // Essay
      questionText = `${stimulusLead}1. Hãy chỉ rõ biến độc lập và biến phụ thuộc trong thí nghiệm/tình huống trên.\n2. Vận dụng kiến thức KHTN đã học, hãy giải thích nguyên nhân khoa học của hiện tượng và đề xuất ít nhất 2 biện pháp ứng dụng vào đời sống hoặc sản xuất tại địa phương.`;
      correctAnswer = 'Barem tự luận chi tiết theo từng ý.';
      explanation = 'Học sinh cần trả lời đủ 2 phần: xác định đúng biến khoa học và giải thích hiện tượng gắn với kiến thức bài học.';
      rationale = `Đánh giá toàn diện năng lực tìm hiểu tự nhiên và vận dụng kiến thức KHTN vào giải quyết vấn đề thực tiễn.`;
    }

    const contextMetadata: ContextMetadata = {
      hasContext: true,
      contextId: phenomenon.phenomenon_id,
      contextType: phenomenon.context_type,
      contextLevel: phenomenon.context_level,
      applicationArea: phenomenon.application_area,
      phenomenon: phenomenon.title,
      stimulus: phenomenon.stimulus,
      realWorldRelevance: true,
      scientificPractice: 'Interpret data',
      sourceType: 'ADAPTED_FROM',
      sourceTitle: phenomenon.source,
      sourceUrl: phenomenon.source_url,
      sourceCountry: phenomenon.source_country,
      adaptationNote: `Việt hóa và gắn kết với chương trình KHTN lớp ${phenomenon.grade} chuẩn GDPT 2018.`
    };

    const question: QuestionItem = {
      id,
      grade: phenomenon.grade,
      semester: 'HK1',
      lessonId: `LESSON_${phenomenon.grade}_SAMPLE`,
      topic: phenomenon.topic,
      subjectArea: phenomenon.subject_area,
      contentDomain: phenomenon.content_domain,
      learningRequirementText: learningRequirementText || phenomenon.curriculum_alignment,
      cognitiveLevel,
      questionType,
      difficulty: phenomenon.difficulty,
      questionText,
      options,
      correctAnswer,
      explanation,
      rationale,
      score: isMcq ? 0.25 : isTf ? 1.0 : isSa ? 0.5 : 1.0,
      sourceLevel: 'TEXTBOOK',
      sourceCitation: {
        documentName: phenomenon.source,
        lessonName: phenomenon.topic
      },
      contextMetadata,
      tags: [phenomenon.application_area, phenomenon.context_type, phenomenon.context_level],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Auto-register traceability chain (Section 22 & AT10)
    const trace = TraceService.buildTraceForQuestion(question);
    if (question.contextMetadata) {
      question.contextMetadata.trace = trace;
    }

    return question;
  }

  /**
   * Section 16 & AT07: Generate Question Family from Single Stimulus
   * STIMULUS -> Q1 (MCQ M1), Q2 (MCQ M2), Q3 (TF M2), Q4 (SA M3), Q5 (Essay M4)
   */
  public static generateQuestionFamilyFromPhenomenon(phenomenon: PhenomenonItem): QuestionItem[] {
    const q1 = this.buildQuestionFromPhenomenon(phenomenon, 'M1', 'MCQ', phenomenon.curriculum_alignment);
    const q2 = this.buildQuestionFromPhenomenon(phenomenon, 'M2', 'MCQ', phenomenon.curriculum_alignment);
    const q3 = this.buildQuestionFromPhenomenon(phenomenon, 'M2', 'TRUE_FALSE', phenomenon.curriculum_alignment);
    const q4 = this.buildQuestionFromPhenomenon(phenomenon, 'M3', 'SHORT_ANSWER', phenomenon.curriculum_alignment);
    const q5 = this.buildQuestionFromPhenomenon(phenomenon, 'M4', 'ESSAY', phenomenon.curriculum_alignment);

    return [q1, q2, q3, q4, q5];
  }
}
