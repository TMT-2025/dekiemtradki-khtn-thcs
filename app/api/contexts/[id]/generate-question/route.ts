import { NextRequest, NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { CognitiveLevel, QuestionType } from '@/types/curriculum';
import { localDb } from '@/database/local-db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const phenom = ContextService.getPhenomenonById(id);
    if (!phenom) {
      return NextResponse.json({ success: false, error: 'Phenomenon not found' }, { status: 404 });
    }

    if (body.family === true) {
      // Generate question family (Section 16 & AT07)
      const family = ContextService.generateQuestionFamilyFromPhenomenon(phenom);
      family.forEach(q => localDb.saveQuestion(q));

      return NextResponse.json({
        success: true,
        mode: 'FAMILY',
        total: family.length,
        data: family
      });
    }

    const cognitiveLevel = (body.cognitiveLevel || 'M2') as CognitiveLevel;
    const questionType = (body.questionType || 'MCQ') as QuestionType;
    const learningRequirementText = body.learningRequirementText || phenom.curriculum_alignment;

    const question = ContextService.buildQuestionFromPhenomenon(
      phenom,
      cognitiveLevel,
      questionType,
      learningRequirementText
    );

    localDb.saveQuestion(question);

    return NextResponse.json({
      success: true,
      mode: 'SINGLE',
      data: question
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
