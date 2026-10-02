import { NextResponse } from 'next/server';
import { QuestionService } from '@/features/question-bank/question-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = await QuestionService.generateQuestionWithAI({
      lessonId: body.lessonId,
      cognitiveLevel: body.cognitiveLevel,
      questionType: body.questionType,
      score: body.score || 0.25
    });

    return NextResponse.json({ question });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
