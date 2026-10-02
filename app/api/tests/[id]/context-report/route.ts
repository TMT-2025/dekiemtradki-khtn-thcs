import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';
import { ContextService } from '@/features/context-engine/context-service';
import { QuestionItem } from '@/types/question';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const test = localDb.getTests().find(t => t.id === id);

    if (!test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    // If test already has a precalculated report, return it
    if (test.contextReport) {
      return NextResponse.json({
        success: true,
        testId: id,
        report: test.contextReport
      });
    }

    // Otherwise calculate dynamically from questions in all parts
    const allQuestions: QuestionItem[] = [];
    test.parts.forEach(part => {
      part.questions.forEach(tq => allQuestions.push(tq.question));
    });

    const report = ContextService.generateContextReport(allQuestions, 0.5);

    return NextResponse.json({
      success: true,
      testId: id,
      report
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
