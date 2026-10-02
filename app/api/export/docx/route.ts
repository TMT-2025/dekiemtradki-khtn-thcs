import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { SpecEngine } from '@/features/spec-engine/spec-engine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'matrix';
  const testId = searchParams.get('testId');
  const matrixId = searchParams.get('id');

  return handleExport({ type, testId, matrixId });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return handleExport(body);
  } catch (e: any) {
    return new NextResponse(e.message, { status: 400 });
  }
}

async function handleExport(params: {
  type: string;
  matrixId?: string | null;
  testId?: string | null;
  matrix?: any;
  spec?: any;
  test?: any;
}) {
  const { type, matrixId, testId, matrix: directMatrix, spec: directSpec, test: directTest } = params;

  try {
    let buffer: Buffer;
    let fileName = 'document.docx';

    if (type === 'matrix') {
      const matrix = directMatrix || (matrixId ? localDb.getMatrixById(matrixId) : undefined) || localDb.getMatrices()[0];
      if (!matrix) return new NextResponse('Matrix not found', { status: 404 });
      buffer = await DocxExportService.exportMatrixDocx(matrix);
      fileName = '01_Ma_tran.docx';
    } else if (type === 'spec') {
      const matrix = directMatrix || (matrixId ? localDb.getMatrixById(matrixId) : undefined) || localDb.getMatrices()[0];
      if (!matrix && !directSpec) return new NextResponse('Matrix or Spec not found', { status: 404 });
      let spec = directSpec;
      if (!spec && matrix) {
        spec = localDb.getSpecificationByMatrixId(matrix.id);
        if (!spec) spec = SpecEngine.generateFromMatrix(matrix);
      }
      buffer = await DocxExportService.exportSpecificationDocx(spec);
      fileName = '02_Ban_dac_ta.docx';
    } else if (type === 'test') {
      const test = directTest || (testId ? localDb.getTestById(testId) : undefined) || localDb.getTests()[0];
      if (!test) return new NextResponse('Test not found', { status: 404 });
      buffer = await DocxExportService.exportTestDocx(test);
      fileName = '03_De_kiem_tra.docx';
    } else if (type === 'answer') {
      const test = directTest || (testId ? localDb.getTestById(testId) : undefined) || localDb.getTests()[0];
      if (!test) return new NextResponse('Test not found', { status: 404 });
      buffer = await DocxExportService.exportAnswerKeyDocx(test);
      fileName = '04_Dap_an.docx';
    } else if (type === 'guide') {
      const test = directTest || (testId ? localDb.getTestById(testId) : undefined) || localDb.getTests()[0];
      if (!test) return new NextResponse('Test not found', { status: 404 });
      buffer = await DocxExportService.exportScoringGuideDocx(test);
      fileName = '05_Huong_dan_cham.docx';
    } else {
      return new NextResponse('Invalid export type', { status: 400 });
    }

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
