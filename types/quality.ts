export type QualitySeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface QualityIssue {
  code: string;
  severity: QualitySeverity;
  stage: 'CURRICULUM' | 'MATRIX' | 'SPECIFICATION' | 'QUESTION' | 'TEST' | 'ANSWER_KEY' | 'CONTEXT';
  message: string;
  expectedValue?: string | number;
  actualValue?: string | number;
  location?: string;
  suggestion?: string;
}

export interface QualityGateResult {
  passed: boolean;
  score: number; // 0 - 100
  totalErrors: number;
  totalWarnings: number;
  issues: QualityIssue[];
  checkedAt: string;
}
