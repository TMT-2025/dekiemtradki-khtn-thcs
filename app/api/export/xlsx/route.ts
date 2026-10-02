import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';
import { XlsxExportService } from '@/features/export-engine/xlsx-export';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'matrix';
  const matrixId = searchParams.get('id');

  return handleExport({ type, matrixId });
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
  matrix?: any;
}) {
  const { type, matrixId, matrix: directMatrix } = params;

  try {
    let buffer: Buffer;
    let fileName = 'spreadsheet.xlsx';

    if (type === 'matrix') {
      const matrix = directMatrix || (matrixId ? localDb.getMatrixById(matrixId) : undefined) || localDb.getMatrices()[0];
      if (!matrix) return new NextResponse('Matrix not found', { status: 404 });
      buffer = await XlsxExportService.exportMatrixXlsx(matrix);
      fileName = 'Ma_tran.xlsx';
    } else if (type === 'questions') {
      const questions = localDb.getQuestions();
      buffer = await XlsxExportService.exportQuestionBankXlsx(questions);
      fileName = 'Ngan_hang_cau_hoi.xlsx';
    } else {
      return new NextResponse('Invalid export type', { status: 400 });
    }

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
