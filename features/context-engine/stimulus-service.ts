import fs from 'fs';
import path from 'path';
import { Stimulus, DataTable, ExperimentDesign, StimulusContent } from '@/types/context';

export class StimulusService {
  private static cachedStimuli: Stimulus[] | null = null;

  public static getStimuli(): Stimulus[] {
    if (!this.cachedStimuli) {
      try {
        const filePath = path.join(process.cwd(), 'database', 'context-stimuli.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.cachedStimuli = JSON.parse(raw);
        } else {
          this.cachedStimuli = [];
        }
      } catch (err) {
        console.error('Error reading context-stimuli.json:', err);
        this.cachedStimuli = [];
      }
    }
    return this.cachedStimuli || [];
  }

  public static getStimulusById(id: string): Stimulus | undefined {
    return this.getStimuli().find(s => s.id === id);
  }

  public static getStimuliByContextId(contextId: string): Stimulus[] {
    return this.getStimuli().filter(s => s.contextId === contextId);
  }

  /**
   * Section 14 & AT09: Synthetic Data Labeling
   * If isSynthetic is true, ensure label 'Dữ liệu mô phỏng phục vụ mục đích đánh giá' is attached.
   */
  public static formatDataTable(table: DataTable): { formattedRows: Record<string, string | number>[]; notice?: string } {
    const notice = table.isSynthetic ? 'Dữ liệu mô phỏng phục vụ mục đích đánh giá.' : undefined;
    return {
      formattedRows: table.rows,
      notice
    };
  }

  /**
   * Section 15: Validate experiment design for middle school feasibility
   */
  public static validateExperimentFeasibility(exp: ExperimentDesign): { isFeasible: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!exp.researchQuestion) issues.push('Thí nghiệm thiếu câu hỏi nghiên cứu.');
    if (!exp.independentVariable) issues.push('Chưa xác định biến độc lập.');
    if (!exp.dependentVariable) issues.push('Chưa xác định biến phụ thuộc.');
    if (!exp.controlledVariables || exp.controlledVariables.length === 0) {
      issues.push('Chưa có biến kiểm soát để đảm bảo tính khách quan của thực nghiệm.');
    }
    return {
      isFeasible: issues.length === 0,
      issues
    };
  }
}
