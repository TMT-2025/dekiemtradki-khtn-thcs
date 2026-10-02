import { NextResponse } from 'next/server';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { localDb } from '@/database/local-db';

export async function POST(req: Request) {
  try {
    const { matrix } = await req.json();
    const updated = MatrixEngine.recalculateMatrix(matrix);
    const qualityGate = QualityGate.validateChain({ matrix: updated });

    return NextResponse.json({
      matrix: updated,
      qualityGate
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
