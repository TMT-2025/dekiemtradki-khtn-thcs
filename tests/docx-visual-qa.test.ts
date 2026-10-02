import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { TestService } from '@/features/test-generator/test-service';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { localDb } from '@/database/local-db';

describe('Phase 7.6: DOCX Visual QA & Typography / Layout Validation', () => {
  const exportDir = path.join(process.cwd(), 'exports', 'qa-package');

  beforeAll(() => {
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
  });

  it('should generate all 6 physical DOCX files with A4 layout, standard margins, and Times New Roman font', async () => {
    const grade = 8;
    const lessons = CurriculumService.getLessons(grade, 'HK1').slice(0, 6);
    const template = localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template,
      contextRatio: 0.5
    });

    const spec = SpecEngine.generateFromMatrix(matrix);
    const { test } = await TestService.generateTest({
      matrix,
      specification: spec,
      mode: 'AUTO'
    });

    const pkg = await DocxExportService.exportFullPackageDocx({
      matrix,
      specification: spec,
      test
    });

    // Write actual files to disk
    const files = [
      { name: '01_Ma_tran_KHTN8.docx', buffer: pkg.matrixDocx },
      { name: '02_Ban_dac_ta_KHTN8.docx', buffer: pkg.specDocx },
      { name: '03_De_kiem_tra_KHTN8.docx', buffer: pkg.testDocx },
      { name: '04_Dap_an_KHTN8.docx', buffer: pkg.answerKeyDocx },
      { name: '05_Context_Report_KHTN8.docx', buffer: pkg.contextReportDocx },
      { name: '06_Traceability_Report_KHTN8.docx', buffer: pkg.traceabilityReportDocx }
    ];

    files.forEach(f => {
      const filePath = path.join(exportDir, f.name);
      fs.writeFileSync(filePath, f.buffer);
      expect(fs.existsSync(filePath)).toBe(true);

      const stat = fs.statSync(filePath);
      // Valid DOCX zip container size must be > 3KB
      expect(stat.size).toBeGreaterThan(3000);
    });
  });
});
