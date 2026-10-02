import { NextRequest, NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const phenomenon = ContextService.getPhenomenonById(id);
    if (phenomenon) {
      const stimulus = ContextService.getStimulusById(id);
      return NextResponse.json({
        success: true,
        type: 'PHENOMENON',
        data: phenomenon,
        stimulus
      });
    }

    const stimulus = ContextService.getStimulusById(id);
    if (stimulus) {
      return NextResponse.json({
        success: true,
        type: 'STIMULUS',
        data: stimulus
      });
    }

    return NextResponse.json({ success: false, error: 'Context not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = ContextService.updatePhenomenon(id, body);
    if (updated) {
      return NextResponse.json({ success: true, data: updated });
    }

    const stimulus = ContextService.getStimulusById(id);
    if (stimulus) {
      const updatedStim = { ...stimulus, ...body };
      ContextService.saveStimulus(updatedStim);
      return NextResponse.json({ success: true, data: updatedStim });
    }

    return NextResponse.json({ success: false, error: 'Context not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deletedPhenom = ContextService.deletePhenomenon(id);
    const deletedStim = ContextService.deleteStimulus(id);

    if (deletedPhenom || deletedStim) {
      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Context not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
