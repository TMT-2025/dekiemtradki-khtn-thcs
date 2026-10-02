import { NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { localDb } from '@/database/local-db';
import { CognitiveLevel, QuestionType } from '@/types/curriculum';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phenomenonId, cognitiveLevel, questionType, learningRequirementText } = body;

    const phenomena = ContextService.getPhenomena();
    const phenom = phenomena.find(p => p.phenomenon_id === phenomenonId);

    if (!phenom) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hiện tượng khoa học tương ứng.' }, { status: 404 });
    }

    const cogLevel: CognitiveLevel = cognitiveLevel || 'TH';
    const qType: QuestionType = questionType || 'MCQ';

    const question = ContextService.buildQuestionFromPhenomenon(
      phenom,
      cogLevel,
      qType,
      learningRequirementText || phenom.curriculum_alignment
    );

    // Save to question bank in localDb
    localDb.saveQuestion(question);

    return NextResponse.json({
      success: true,
      question
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
