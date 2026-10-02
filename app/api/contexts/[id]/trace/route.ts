import { NextRequest, NextResponse } from 'next/server';
import { TraceService } from '@/features/context-engine/trace-service';
import { ContextService } from '@/features/context-engine/context-service';
import { localDb } from '@/database/local-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if ID is a question ID with trace
    let trace = TraceService.getTraceByQuestionId(id);

    // If not found in memory, search in database questions
    if (!trace) {
      const q = localDb.getQuestions().find(item => item.id === id);
      if (q) {
        trace = TraceService.buildTraceForQuestion(q);
      }
    }

    // If still not found, check if it's a phenomenon ID
    if (!trace) {
      const phenom = ContextService.getPhenomenonById(id);
      if (phenom) {
        const dummyQ = ContextService.buildQuestionFromPhenomenon(
          phenom,
          'M2',
          'MCQ',
          phenom.curriculum_alignment
        );
        trace = dummyQ.contextMetadata?.trace;
      }
    }

    if (!trace) {
      return NextResponse.json({ success: false, error: 'Trace chain not found' }, { status: 404 });
    }

    const verification = TraceService.verifyTraceChain(trace);

    return NextResponse.json({
      success: true,
      data: trace,
      verification
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
