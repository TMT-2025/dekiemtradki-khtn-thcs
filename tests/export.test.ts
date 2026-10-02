import { describe, it, expect } from 'vitest';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { TestService } from '@/features/test-generator/test-service';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { XlsxExportService } from '@/features/export-engine/xlsx-export';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { localDb } from '@/database/local-db';

describe('DocxExportService & XlsxExportService', () => {
  it('should export all 5 official DOCX files with non-empty binary buffers', async () => {
    const lessons = CurriculumService.getLessons(6, 'HK1').slice(0, 6);
    const template = localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade: 6,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template
    });

    const spec = SpecEngine.generateFromMatrix(matrix);
    const { test } = await TestService.generateTest({
      matrix,
      specification: spec,
      mode: 'AUTO'
    });

    // 1. 01_Ma_tran.docx
    const matrixDocx = await DocxExportService.exportMatrixDocx(matrix);
    expect(matrixDocx).toBeDefined();
    expect(matrixDocx.length).toBeGreaterThan(1000);

    // 2. 02_Ban_dac_ta.docx
    const specDocx = await DocxExportService.exportSpecificationDocx(spec);
    expect(specDocx).toBeDefined();
    expect(specDocx.length).toBeGreaterThan(1000);

    // 3. 03_De_kiem_tra.docx
    const testDocx = await DocxExportService.exportTestDocx(test);
    expect(testDocx).toBeDefined();
    expect(testDocx.length).toBeGreaterThan(1000);

    // 4. 04_Dap_an.docx
    const answerDocx = await DocxExportService.exportAnswerKeyDocx(test);
    expect(answerDocx).toBeDefined();
    expect(answerDocx.length).toBeGreaterThan(1000);

    // 5. 05_Huong_dan_cham.docx
    const guideDocx = await DocxExportService.exportScoringGuideDocx(test);
    expect(guideDocx).toBeDefined();
    expect(guideDocx.length).toBeGreaterThan(1000);
  });

  it('should export XLSX files with valid excel workbooks', async () => {
    const lessons = CurriculumService.getLessons(7, 'HK1').slice(0, 6);
    const template = localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade: 7,
      schoolYear: '2026-2027',
      semester: 'HK1',
      assessmentType: 'MID_TERM_1',
      selectedLessonIds: lessons.map(l => l.id),
      template: template
    });

    const matrixXlsx = await XlsxExportService.exportMatrixXlsx(matrix);
    expect(matrixXlsx).toBeDefined();
    expect(matrixXlsx.length).toBeGreaterThan(500);

    const questionsXlsx = await XlsxExportService.exportQuestionBankXlsx(localDb.getQuestions());
    expect(questionsXlsx).toBeDefined();
    expect(questionsXlsx.length).toBeGreaterThan(500);
  });
});
