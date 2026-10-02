import { NextResponse } from 'next/server';
import { MatrixEngine } from '@/features/matrix-engine/matrix-engine';
import { QualityGate } from '@/features/quality-gate/quality-gate';
import { localDb } from '@/database/local-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const template = localDb.getTemplateById(body.templateId) || localDb.getTemplates()[0];

    const matrix = MatrixEngine.generateMatrix({
      grade: body.grade,
      semester: body.semester,
      schoolYear: body.schoolYear || '2026–2027',
      assessmentType: body.assessmentType || 'MID_TERM_1',
      selectedLessonIds: body.selectedLessonIds,
      template,
      enableM4: body.enableM4,
      contextRatio: body.contextRatio !== undefined ? Number(body.contextRatio) : 0.5
    });

    const qualityGate = QualityGate.validateChain({ matrix });

    return NextResponse.json({
      matrix,
      qualityGate
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
