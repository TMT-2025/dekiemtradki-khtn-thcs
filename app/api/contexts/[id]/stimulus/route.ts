import { NextRequest, NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { Stimulus } from '@/types/context';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const stimulusId = body.id || `STIM_${id}_${Date.now()}`;
    const newStimulus: Stimulus = {
      id: stimulusId,
      contextId: id,
      type: body.type || 'TEXT',
      title: body.title,
      content: body.content || '',
      data: body.data,
      experiment: body.experiment,
      readingLoad: body.readingLoad || 'LOW',
      sourceRefs: body.sourceRefs || [],
      isSynthetic: body.isSynthetic !== undefined ? body.isSynthetic : false,
      localizationStatus: body.localizationStatus || 'LOCALIZED',
      qualityStatus: body.qualityStatus || 'PASSED'
    };

    ContextService.saveStimulus(newStimulus);

    // Also update phenomenon stimulus reference if phenomenon exists
    const phenom = ContextService.getPhenomenonById(id);
    if (phenom) {
      phenom.stimulus = {
        type: newStimulus.type,
        title: newStimulus.title || phenom.title,
        leadParagraph: newStimulus.content,
        dataHeaders: newStimulus.data?.[0]?.columns.map(c => c.label),
        dataRows: newStimulus.data?.[0]?.rows.map(r => Object.values(r)),
        isSynthetic: newStimulus.isSynthetic
      };
      ContextService.savePhenomenon(phenom);
    }

    return NextResponse.json({
      success: true,
      data: newStimulus
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
