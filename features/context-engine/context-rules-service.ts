import fs from 'fs';
import path from 'path';
import { ContextRulesConfig } from '@/types/context';

export class ContextRulesService {
  private static cachedConfig: ContextRulesConfig | null = null;

  public static getConfig(): ContextRulesConfig {
    if (!this.cachedConfig) {
      try {
        const filePath = path.join(process.cwd(), 'database', 'context-rules.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.cachedConfig = JSON.parse(raw);
        } else {
          this.cachedConfig = this.getDefaultConfig();
        }
      } catch (err) {
        console.error('Error reading context-rules.json:', err);
        this.cachedConfig = this.getDefaultConfig();
      }
    }
    return this.cachedConfig!;
  }

  public static getDefaultConfig(): ContextRulesConfig {
    return {
      contextTargetDefault: 50,
      allowedContextPercentages: [20, 30, 40, 50, 60, 70, 80, 90, 100],
      requireSourceForInternational: true,
      requireQualityGateForQuestion: true,
      allowSyntheticData: true,
      requireSyntheticDataLabel: true,
      requireHumanApproval: true
    };
  }

  public static isAllowedPercentage(percentage: number): boolean {
    const config = this.getConfig();
    return config.allowedContextPercentages.includes(percentage);
  }
}
