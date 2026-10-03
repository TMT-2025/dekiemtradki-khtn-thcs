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

  /**
   * Generates a fully matched, highly authentic context with complete leadParagraph and optional data table
   * matching the question's specific topic, subject area, and grade.
   */
  public static generateRichContextForQuestion(q: QuestionItem): ContextMetadata {
    const raw = this.buildContextMetadata(q);
    if (q.questionType === 'MCQ' && raw.stimulus) {
      raw.stimulus.type = 'TEXT';
      delete raw.stimulus.dataHeaders;
      delete raw.stimulus.dataRows;
    }
    return raw;
  }

  private static buildContextMetadata(q: QuestionItem): ContextMetadata {
    const topicLow = (q.topic || '').toLowerCase();
    const reqLow = (q.learningRequirementText || '').toLowerCase();
    const textLow = (q.questionText || '').toLowerCase();
    const combined = `${topicLow} ${reqLow} ${textLow}`;

    // 0. Search from the enriched phenomenon library for exact grade matching
    const phenomList = this.getPhenomena().filter(p => p.grade === q.grade);
    let bestMatch: PhenomenonItem | null = null;
    let bestScore = 0;

    for (const p of phenomList) {
      const pCombined = `${p.title} ${p.topic} ${p.description} ${p.curriculum_alignment}`.toLowerCase();
      const words = combined.split(/[\s,.;:()\-–—\/]+/).filter(w => w.length > 2);
      let score = 0;
      for (const w of words) {
        if (pCombined.includes(w)) {
          score++;
        }
      }
      if (score > bestScore && score >= 2) {
        bestScore = score;
        bestMatch = p;
      }
    }

    if (bestMatch && bestMatch.stimulus) {
      return {
        hasContext: true,
        contextId: `${bestMatch.phenomenon_id}_${q.id}`,
        contextType: bestMatch.context_type,
        contextLevel: bestMatch.context_level,
        applicationArea: bestMatch.application_area,
        phenomenon: bestMatch.title,
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: bestMatch.source,
        sourceUrl: bestMatch.source_url,
        sourceCountry: bestMatch.source_country || 'Việt Nam',
        adaptationNote: `Tình huống thực tế chuẩn GDPT 2018 gắn kết với ${bestMatch.topic}.`,
        stimulus: {
          type: q.questionType === 'TRUE_FALSE' ? (bestMatch.stimulus.type || 'TABLE') : 'TEXT',
          title: bestMatch.stimulus.title,
          leadParagraph: bestMatch.stimulus.leadParagraph,
          ...(q.questionType === 'TRUE_FALSE' && bestMatch.stimulus.dataHeaders ? {
            dataHeaders: bestMatch.stimulus.dataHeaders,
            dataRows: bestMatch.stimulus.dataRows
          } : {})
        }
      };
    }

    // Grade 6 Priority: Đo lường (thước, cân, nhiệt kế, thể tích)
    if (q.grade === 6 && (combined.includes('đo') || combined.includes('thước') || combined.includes('cân') || combined.includes('nhiệt kế') || combined.includes('kính lúp'))) {
      const res: ContextMetadata = {
        hasContext: true,
        contextId: `CTX_MEASURE_6_${q.id}`,
        contextType: 'FAMILY_SCHOOL',
        contextLevel: 'C1',
        applicationArea: 'DAILY_LIFE',
        phenomenon: 'Kĩ năng đo lường các đại lượng vật lí trong đời sống hàng ngày và thực hành thí nghiệm',
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Sách giáo khoa KHTN 6 Kết nối tri thức — Chương I: Mở đầu & Đo lường',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Tình huống thực tế lựa chọn dụng cụ đo có GHĐ và ĐCNN thích hợp.',
        stimulus: {
          type: q.questionType === 'TRUE_FALSE' ? 'TABLE' : 'TEXT',
          title: 'Khảo sát kĩ năng lựa chọn dụng cụ đo lường trong phòng thực hành',
          leadParagraph: 'Để đo lường chính xác các đại lượng như độ dài, khối lượng, thể tích và nhiệt độ, người làm thí nghiệm phải luôn chọn dụng cụ đo có giới hạn đo (GHĐ) lớn hơn giá trị cần đo và có độ chia nhỏ nhất (ĐCNN) phù hợp với độ chính xác yêu cầu.',
          ...(q.questionType === 'TRUE_FALSE' ? {
            dataHeaders: ['Đại lượng cần đo', 'Dụng cụ khuyến nghị', 'GHĐ phù hợp', 'ĐCNN tối ưu'],
            dataRows: [
              ['Chiều dài lớp học', 'Thước cuộn', '10 m', '1 cm'],
              ['Đường kính miệng cốc', 'Thước kẹp', '150 mm', '0,1 mm'],
              ['Khối lượng hộp sữa', 'Cân điện tử', '500 g', '0,1 g'],
              ['Nhiệt độ nước đá đang tan', 'Nhiệt kế rượu', '100°C', '1°C']
            ]
          } : {})
        }
      };
      return res;
    }

    // 1. Kim loại, dãy hoạt động, tính chất vật lí, hóa học của kim loại
    if (combined.includes('kim loại') || combined.includes('tính chất vật lí chung') || combined.includes('dãy hoạt động')) {
      return {
        hasContext: true,
        contextId: `CTX_METAL_${q.id}`,
        contextType: 'FAMILY_SCHOOL',
        contextLevel: 'C2',
        applicationArea: 'MATERIALS',
        phenomenon: 'Ứng dụng tính chất vật lí và cơ học của kim loại trong đời sống và kỹ thuật chế tạo',
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Sách giáo khoa KHTN 9 — Ứng dụng thực tiễn của vật liệu kim loại',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Tình huống thực tế chuẩn GDPT 2018 gắn kết tính chất vật lí kim loại với vật dụng gia đình.',
        stimulus: {
          type: 'TABLE',
          title: 'Khảo sát tính chất vật lí đặc trưng và ứng dụng kĩ thuật của các kim loại thông dụng',
          leadParagraph: 'Trong đời sống hàng ngày và sản xuất công nghiệp, các kim loại như đồng (Cu), nhôm (Al), sắt (Fe), bạc (Ag) được ứng dụng rộng rãi nhờ vào những tính chất vật lí chung đặc trưng. Nhôm và đồng được dùng phổ biến làm lõi dây dẫn điện và dụng cụ đun nấu nhờ tính dẫn điện, dẫn nhiệt rất tốt; vàng và bạc được dùng làm đồ trang sức nhờ ánh kim lấp lánh và tính dẻo cao; sắt thép được ứng dụng làm khung nhà và máy móc nhờ độ bền cơ học cao.',
          dataHeaders: ['Kim loại', 'Khối lượng riêng (g/cm³)', 'Nhiệt độ nóng chảy (°C)', 'Độ dẫn điện tương đối', 'Ứng dụng thực tiễn chính'],
          dataRows: [
            ['Bạc (Ag)', '10.5', '961', '100 (Cao nhất)', 'Trang sức cao cấp, tiếp điểm điện tử'],
            ['Đồng (Cu)', '8.96', '1083', '95 (Rất cao)', 'Lõi dây cáp điện, ống tản nhiệt'],
            ['Nhôm (Al)', '2.70', '660', '60 (Khá cao)', 'Khung cửa, vỏ máy bay, xoong nồi'],
            ['Sắt (Fe)', '7.87', '1538', '17 (Trung bình)', 'Cốt thép xây dựng, máy móc cơ khí']
          ]
        }
      };
    }

    // 2. Cơ năng, Động năng, Thế năng, Công, Công suất
    if (combined.includes('động năng') || combined.includes('thế năng') || combined.includes('cơ năng') || combined.includes('công suất')) {
      return {
        hasContext: true,
        contextId: `CTX_ENERGY_${q.id}`,
        contextType: 'LOCAL',
        contextLevel: 'C2',
        applicationArea: 'ENERGY',
        phenomenon: 'Sự bảo toàn và chuyển hóa cơ năng tại Nhà máy Thủy điện và Tàu lượn siêu tốc',
        realWorldRelevance: true,
        scientificPractice: 'Interpret data',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Tập đoàn Điện lực Việt Nam (EVN) & Ứng dụng Cơ năng KHTN 9',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Tích hợp số liệu chuyển hóa thế năng thành động năng trong vận hành tuabin thủy điện.',
        stimulus: {
          type: 'TABLE',
          title: 'Khảo sát sự chuyển hóa cơ năng của khối nước trên hồ chứa và chuyển động tàu lượn',
          leadParagraph: 'Tại các nhà máy thủy điện (như Hòa Bình, Sơn La), nguồn nước tích trữ trên hồ chứa ở trên cao mang thế năng trọng trường rất lớn. Khi xả nước chảy xuống qua tuabin, thế năng chuyển hóa thành động năng của dòng nước làm quay tuabin máy phát điện. Tương tự, trong trò chơi tàu lượn siêu tốc tại công viên giải trí, khi tàu lên tới vị trí cao nhất thì có thế năng cực đại; khi lao xuống dốc, thế năng chuyển hóa thành động năng làm tàu chuyển động rất nhanh.',
          dataHeaders: ['Vị trí quan sát', 'Độ cao h (m)', 'Vận tốc v (m/s)', 'Dạng cơ năng chủ đạo'],
          dataRows: [
            ['Đỉnh dốc cao nhất (A)', '40', '1.5', 'Thế năng trọng trường cực đại'],
            ['Lưng chừng dốc (B)', '18', '21.0', 'Cả động năng và thế năng'],
            ['Đáy dốc trũng nhất (C)', '1.5', '27.8', 'Động năng cực đại']
          ]
        }
      };
    }

    // 3. Khúc xạ ánh sáng, Phản xạ toàn phần, Thấu kính, Lăng kính
    if (combined.includes('khúc xạ') || combined.includes('thấu kính') || combined.includes('lăng kính') || combined.includes('phản xạ toàn phần') || combined.includes('ánh sáng')) {
      return {
        hasContext: true,
        contextId: `CTX_OPTICS_${q.id}`,
        contextType: 'FAMILY_SCHOOL',
        contextLevel: 'C2',
        applicationArea: 'TECHNOLOGY',
        phenomenon: 'Hiện tượng khúc xạ ánh sáng khi truyền qua các môi trường trong suốt và ứng dụng thực tiễn',
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Sách giáo khoa KHTN 9 — Quang học thực nghiệm',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Mô phỏng đường truyền tia sáng từ không khí vào nước và hiện tượng nhìn thấy đáy hồ.',
        stimulus: {
          type: 'TABLE',
          title: 'Thực nghiệm đo góc tới và góc khúc xạ khi chiếu tia sáng từ không khí vào nước',
          leadParagraph: 'Khi quan sát một chiếc thìa cắm nghiêng trong cốc nước trong suốt, ta thấy chiếc thìa dường như bị gãy khúc tại mặt phân cách giữa không khí và nước; hay khi nhìn xuống đáy hồ bơi trong vắt, đáy hồ trông có vẻ nông hơn so với độ sâu thực tế. Hiện tượng này xảy ra do tia sáng bị đổi hướng truyền (khúc xạ) khi đi từ môi trường này sang môi trường khác có chiết suất khác nhau.',
          dataHeaders: ['Góc tới trong không khí i (°)', 'Góc khúc xạ trong nước r (°)', 'Góc lệch tia sáng D (°)'],
          dataRows: [
            ['0° (Chiếu vuông góc)', '0°', '0° (Tia truyền thẳng)'],
            ['30°', '22.1°', '7.9°'],
            ['60°', '40.5°', '19.5°']
          ]
        }
      };
    }

    // 4. Di truyền học, Mendel, Gene, DNA, Nhiễm sắc thể
    if (combined.includes('di truyền') || combined.includes('mendel') || combined.includes('gene') || combined.includes('dna') || combined.includes('nhiễm sắc thể') || combined.includes('biến dị')) {
      return {
        hasContext: true,
        contextId: `CTX_GENETICS_${q.id}`,
        contextType: 'LOCAL',
        contextLevel: 'C3',
        applicationArea: 'AGRICULTURE',
        phenomenon: 'Khảo sát quy luật di truyền tính trạng theo Mendel và cấu trúc phân tử DNA ở sinh vật',
        realWorldRelevance: true,
        scientificPractice: 'Interpret data',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Viện Di truyền Nông nghiệp Việt Nam & SGK KHTN 9',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Ứng dụng quy luật di truyền phân li độc lập trong lai tạo chọn giống cây trồng.',
        stimulus: {
          type: 'TABLE',
          title: 'Kết quả lai thực nghiệm các cặp tính trạng tương phản theo quy luật di truyền Mendel',
          leadParagraph: 'Trong tự nhiên và sản xuất nông nghiệp, các tính trạng của cơ thể sinh vật (như màu hoa, hình dạng hạt, màu mắt, nhóm máu) được di truyền từ thế hệ bố mẹ sang thế hệ con cháu nhờ các gene nằm trên phân tử DNA trong nhân tế bào. Khi tiến hành các phép lai thuần chủng khác nhau về một cặp tính trạng tương phản, Mendel đã phát hiện ra các quy luật di truyền phân li độc lập và đồng tính ở thế hệ con lai.',
          dataHeaders: ['Phép lai khảo sát', 'Kiểu gene P', 'Kiểu hình F1', 'Tỉ lệ phân li kiểu hình ở F2'],
          dataRows: [
            ['Lai đậu hoa đỏ × hoa trắng', 'AA × aa', '100% hoa đỏ (Aa)', '3 hoa đỏ : 1 hoa trắng (75% : 25%)'],
            ['Lai hạt vàng × hạt xanh', 'BB × bb', '100% hạt vàng (Bb)', '3 hạt vàng : 1 hạt xanh (75% : 25%)'],
            ['Lai phân tích F1', 'Aa × aa', '50% Aa : 50% aa', '1 hoa đỏ : 1 hoa trắng (50% : 50%)']
          ]
        }
      };
    }

    // 5. Phi kim, hợp chất hữu cơ, Alkane, Alkene, Khí gas, Nhiên liệu
    if (combined.includes('hữu cơ') || combined.includes('alkane') || combined.includes('alkene') || combined.includes('nhiên liệu') || combined.includes('khí gas') || combined.includes('cacbon') || combined.includes('carbon')) {
      return {
        hasContext: true,
        contextId: `CTX_ORGANIC_${q.id}`,
        contextType: 'FAMILY_SCHOOL',
        contextLevel: 'C2',
        applicationArea: 'ENERGY',
        phenomenon: 'Nghiên cứu quá trình đốt cháy nhiên liệu khí gas (LPG) và kiểm soát khí thải nhà kính',
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Tổng công ty Khí Việt Nam (PV GAS) & SGK KHTN 9',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Bối cảnh sử dụng năng lượng đốt cháy sạch trong gia đình và bảo vệ môi trường không khí.',
        stimulus: {
          type: 'TABLE',
          title: 'So sánh nhiệt lượng tỏa ra và sản phẩm cháy của các loại nhiên liệu hydrocarbon thông dụng',
          leadParagraph: 'Khí gas đun nấu gia đình (LPG) có thành phần chính là propane (C3H8) và butane (C4H10). Khi được cung cấp đủ không khí (oxygen), khí gas cháy hoàn toàn với ngọn lửa xanh biếc, tỏa nhiệt lượng lớn và chỉ tạo ra khí carbon dioxide (CO2) cùng hơi nước (H2O), không tạo muội than đen đáy nồi.',
          dataHeaders: ['Nhiên liệu khí', 'Công thức phân tử', 'Nhiệt lượng tỏa ra (kJ/g)', 'Đặc điểm ngọn lửa khi cháy'],
          dataRows: [
            ['Methane', 'CH4', '55.5', 'Ngọn lửa xanh nhạt, không sinh muội khói'],
            ['Propane', 'C3H8', '50.3', 'Ngọn lửa xanh đậm, nhiệt lượng tỏa ra rất cao'],
            ['Butane', 'C4H10', '49.5', 'Ngọn lửa xanh, dùng trong các bình gas mini du lịch']
          ]
        }
      };
    }

    // 6. Acid, Base, pH, Muối, Oxide
    if (combined.includes('acid') || combined.includes('base') || combined.includes('ph') || combined.includes('oxide') || combined.includes('muối') || combined.includes('phân bón')) {
      return {
        hasContext: true,
        contextId: `CTX_ACID_BASE_${q.id}`,
        contextType: 'LOCAL',
        contextLevel: 'C2',
        applicationArea: 'AGRICULTURE',
        phenomenon: 'Khảo sát thực tiễn: Đo độ pH của đất nông nghiệp và xử lý chua đất bằng vôi bột',
        realWorldRelevance: true,
        scientificPractice: 'Interpret data',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Sở Nông nghiệp và PTNT Đồng bằng sông Cửu Long & SGK KHTN 8',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Thực tiễn cải tạo độ chua của đất canh tác lúa nước bằng vôi nông nghiệp.',
        stimulus: {
          type: 'TABLE',
          title: 'Khảo sát chỉ số độ pH của các mẫu đất nông nghiệp trước và sau khi bón vôi bột khử chua',
          leadParagraph: 'Độ pH là chỉ số quan trọng phản ánh môi trường sống của sinh vật và độ phì nhiêu của đất trồng. Tại các vùng đất phèn, độ pH của đất thường xuống thấp từ 4.0 đến 4.5 làm rễ cây bị nghẹt và khó hấp thụ dinh dưỡng. Để cải tạo đất phèn, nông dân sử dụng vôi bột (CaO) nhằm trung hòa acid dư thừa, đưa độ pH đất về ngưỡng trung tính từ 6.0 đến 6.5 thích hợp cho cây trồng sinh trưởng.',
          dataHeaders: ['Mẫu đất khảo sát', 'Độ pH ban đầu', 'Khối lượng vôi bón (kg/ha)', 'Độ pH sau khi xử lý'],
          dataRows: [
            ['Đất phèn nặng', '4.0', '1500', '6.0 (Cải thiện tốt)'],
            ['Đất chua vừa', '4.8', '800', '6.2 (Thích hợp cây trồng)'],
            ['Đất trung tính', '6.5', '0 (Không bón)', '6.5 (Đạt chuẩn sinh trưởng)']
          ]
        }
      };
    }

    // 7. Dòng điện, mạch điện, cường độ dòng điện, hiệu điện thế
    if (combined.includes('dòng điện') || combined.includes('mạch điện') || combined.includes('cường độ') || combined.includes('hiệu điện thế') || combined.includes('điện trở')) {
      return {
        hasContext: true,
        contextId: `CTX_CIRCUIT_${q.id}`,
        contextType: 'FAMILY_SCHOOL',
        contextLevel: 'C2',
        applicationArea: 'SAFETY',
        phenomenon: 'Khảo sát mạch điện gia dụng và các biện pháp an toàn khi sử dụng thiết bị điện',
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Cẩm nang An toàn điện sinh hoạt — EVN & SGK KHTN',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Tình huống an toàn điện thực tế khi mắc song song các thiết bị tiêu thụ điện gia đình.',
        stimulus: {
          type: 'TABLE',
          title: 'Bảng thông số kĩ thuật công suất và cường độ dòng điện định mức của các thiết bị điện gia dụng',
          leadParagraph: 'Trong mạng điện gia đình, các thiết bị điện như bóng đèn chiếu sáng, quạt máy, nồi cơm điện được mắc song song vào nguồn điện 220V để có thể hoạt động độc lập với hiệu điện thế định mức. Để đảm bảo an toàn phòng chống cháy nổ và điện giật, hệ thống điện gia đình luôn được trang bị cầu dao tự động (aptomat) ngắt mạch khi có sự cố quá tải hoặc đoản mạch.',
          dataHeaders: ['Thiết bị điện', 'Công suất định mức (W)', 'Hiệu điện thế (V)', 'Cường độ dòng điện (A)'],
          dataRows: [
            ['Bóng đèn LED chiếu sáng', '20', '220', '0.09'],
            ['Quạt trần làm mát', '75', '220', '0.34'],
            ['Bình đun siêu tốc', '1800', '220', '8.18']
          ]
        }
      };
    }

    // 8. Tế bào, quang hợp, hô hấp tế bào, thế giới sống
    if (combined.includes('tế bào') || combined.includes('quang hợp') || combined.includes('hô hấp') || combined.includes('sinh vật') || combined.includes('vi khuẩn')) {
      return {
        hasContext: true,
        contextId: `CTX_CELL_${q.id}`,
        contextType: 'FAMILY_SCHOOL',
        contextLevel: 'C2',
        applicationArea: 'HEALTH',
        phenomenon: 'Thực hành quan sát cấu tạo tế bào và hoạt động trao đổi chất ở sinh vật dưới kính hiển vi',
        realWorldRelevance: true,
        scientificPractice: 'Interpret data',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Sách giáo khoa Khoa học tự nhiên — Bài học Tế bào',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Thực hành làm tiêu bản hiển vi tế bào vảy hành và tế bào niêm mạc khoang miệng.',
        stimulus: {
          type: 'TABLE',
          title: 'Bảng đối chiếu đặc điểm cấu tạo tế bào thực vật và động vật trong giờ thực hành',
          leadParagraph: 'Tế bào là đơn vị cơ bản cấu tạo nên mọi cơ thể sống từ đơn bào đến đa bào. Khi làm tiêu bản tế bào vảy hành (thực vật) và tế bào niêm mạc khoang miệng (động vật) soi dưới kính hiển vi quang học ở độ phóng đại 400 lần, học sinh quan sát rõ màng tế bào, chất tế bào và nhân tế bào; đồng thời nhận biết được lục lạp và thành tế bào cellulose đặc trưng ở tế bào thực vật.',
          dataHeaders: ['Thành phần cấu trúc', 'Tế bào thực vật', 'Tế bào động vật', 'Chức năng sinh học chính'],
          dataRows: [
            ['Màng tế bào', 'Có', 'Có', 'Bảo vệ và kiểm soát chất ra vào tế bào'],
            ['Chất tế bào', 'Có', 'Có', 'Nơi diễn ra các hoạt động sống cơ bản'],
            ['Nhân tế bào', 'Có', 'Có', 'Trung tâm lưu trữ và điều khiển di truyền'],
            ['Thành tế bào & Lục lạp', 'Có', 'Không', 'Quang hợp và tạo khung nâng đỡ cơ học']
          ]
        }
      };
    }

    // 9. Thể của chất, sự chuyển thể, oxygen, không khí
    if (combined.includes('chất') || combined.includes('chuyển thể') || combined.includes('nóng chảy') || combined.includes('đông đặc') || combined.includes('bay hơi') || combined.includes('không khí')) {
      return {
        hasContext: true,
        contextId: `CTX_MATTER_${q.id}`,
        contextType: 'GLOBAL',
        contextLevel: 'C1',
        applicationArea: 'ENVIRONMENT',
        phenomenon: 'Quan sát vòng tuần hoàn của nước và các quá trình chuyển thể của chất trong tự nhiên',
        realWorldRelevance: true,
        scientificPractice: 'Apply science knowledge',
        sourceType: 'ADAPTED_FROM',
        sourceTitle: 'Hiện tượng tự nhiên & SGK KHTN 6 Kết nối tri thức',
        sourceCountry: 'Việt Nam',
        adaptationNote: 'Gắn kết các thể của nước với chu trình khí tượng và thời tiết hàng ngày.',
        stimulus: {
          type: 'TABLE',
          title: 'Bảng tổng hợp đặc điểm các quá trình chuyển thể của nước trong tự nhiên',
          leadParagraph: 'Trong tự nhiên, dưới tác dụng của năng lượng bức xạ mặt trời, nước từ bề mặt ao hồ, sông suối và đại dương bay hơi lên không quyển tạo thành hơi nước. Khi hơi nước gặp không khí lạnh ở tầng cao, nó ngưng tụ thành các giọt nước li ti kết hợp lại thành những đám mây. Khi các giọt nước đủ nặng, chúng rơi xuống thành mưa trở lại mặt đất, duy trì sự sống cho toàn bộ sinh quyển.',
          dataHeaders: ['Quá trình chuyển thể', 'Trạng thái ban đầu', 'Trạng thái kết thúc', 'Điều kiện nhiệt độ'],
          dataRows: [
            ['Bay hơi', 'Thể lỏng', 'Thể khí (hơi)', 'Thu nhiệt từ môi trường'],
            ['Ngưng tụ', 'Thể khí (hơi)', 'Thể lỏng', 'Tỏa nhiệt ra môi trường'],
            ['Nóng chảy', 'Thể rắn (băng đá)', 'Thể lỏng', 'Nhiệt độ trên 0°C'],
            ['Đông đặc', 'Thể lỏng', 'Thể rắn', 'Nhiệt độ hạ xuống dưới 0°C']
          ]
        }
      };
    }

    // 10. Fallback mặc định theo đúng bài học và YCCĐ
    return {
      hasContext: true,
      contextId: `CTX_GENERAL_${q.id}`,
      contextType: 'FAMILY_SCHOOL',
      contextLevel: 'C2',
      applicationArea: 'DAILY_LIFE',
      phenomenon: `Khảo sát hiện tượng thực tế và ứng dụng kĩ thuật liên quan đến "${q.topic}"`,
      realWorldRelevance: true,
      scientificPractice: 'Apply science knowledge',
      sourceType: 'ADAPTED_FROM',
      sourceTitle: `Sách giáo khoa Khoa học tự nhiên ${q.grade} — Bài học ${q.topic}`,
      sourceCountry: 'Việt Nam',
      adaptationNote: `Tình huống thực tiễn gắn với nội dung bài học "${q.topic}" chuẩn GDPT 2018.`,
      stimulus: {
        type: 'TEXT',
        title: `Tình huống thực tế và ứng dụng khoa học trong đời sống liên quan đến "${q.topic}"`,
        leadParagraph: `Trong đời sống thực tiễn và kỹ thuật hiện đại, kiến thức về "${q.topic}" được ứng dụng trực tiếp để giải thích các hiện tượng tự nhiên và giải quyết các bài toán sản xuất. Dựa trên yêu cầu cần đạt: "${q.learningRequirementText}", học sinh phân tích bối cảnh và áp dụng các nguyên lí khoa học để giải quyết vấn đề đặt ra.`
      }
    };
  }
}
