import { NextRequest, NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { QuestionItem } from '@/types/question';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    let question: QuestionItem | undefined = body.question;

    if (!question) {
      const phenom = ContextService.getPhenomenonById(id);
      if (!phenom) {
        return NextResponse.json({ success: false, error: 'Context or Question not found' }, { status: 404 });
      }

      // Build a representative question to test quality gate
      question = ContextService.buildQuestionFromPhenomenon(
        phenom,
        'M2',
        'MCQ',
        phenom.curriculum_alignment
      );
    }

    const detailedResult = ContextService.evaluateDetailedQuality(question);
    const legacyResult = ContextService.validateContextQuality(question);

    return NextResponse.json({
      success: true,
      contextId: id,
      passed: detailedResult.passed,
      status: detailedResult.status,
      score: detailedResult.score,
      blockingIssues: detailedResult.blockingIssues,
      warnings: detailedResult.warnings,
      checks: detailedResult.checks,
      legacy: legacyResult
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
