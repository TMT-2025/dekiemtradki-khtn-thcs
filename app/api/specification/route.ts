import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';
import { SpecEngine } from '@/features/spec-engine/spec-engine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matrixId = searchParams.get('matrixId');

  let matrix = matrixId ? localDb.getMatrixById(matrixId) : undefined;
  if (!matrix) {
    const allMatrices = localDb.getMatrices();
    if (allMatrices.length > 0) matrix = allMatrices[0];
  }

  if (!matrix) {
    return NextResponse.json({ specification: null, matrix: null });
  }

  let spec = localDb.getSpecificationByMatrixId(matrix.id);
  if (!spec) {
    spec = SpecEngine.generateFromMatrix(matrix);
    localDb.saveSpecification(spec);
  }

  return NextResponse.json({
    specification: spec,
    matrix
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matrix: clientMatrix, matrixId } = body;

    let matrix = clientMatrix || (matrixId ? localDb.getMatrixById(matrixId) : undefined);
    if (!matrix) {
      const allMatrices = localDb.getMatrices();
      if (allMatrices.length > 0) matrix = allMatrices[0];
    }

    if (!matrix) {
      return NextResponse.json({ specification: null, matrix: null });
    }

    const spec = SpecEngine.generateFromMatrix(matrix);
    return NextResponse.json({
      specification: spec,
      matrix
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
