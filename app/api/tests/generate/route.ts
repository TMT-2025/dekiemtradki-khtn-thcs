import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';
import { SpecEngine } from '@/features/spec-engine/spec-engine';
import { TestService } from '@/features/test-generator/test-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const matrix = localDb.getMatrixById(body.matrixId);
    if (!matrix) {
      return NextResponse.json({ error: 'Không tìm thấy ma trận' }, { status: 404 });
    }

    let spec = localDb.getSpecificationByMatrixId(matrix.id);
    if (!spec) {
      spec = SpecEngine.generateFromMatrix(matrix);
      localDb.saveSpecification(spec);
    }

    const result = await TestService.generateTest({
      matrix,
      specification: spec,
      testCode: body.testCode || '101',
      mode: body.mode || 'AUTO'
    });

    return NextResponse.json({
      test: result.test,
      matchingResults: result.matchingResults,
      hasMissingQuestions: result.hasMissingQuestions
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
