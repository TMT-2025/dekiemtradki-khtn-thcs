import { NextResponse } from 'next/server';
import { QuestionService } from '@/features/question-bank/question-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = await QuestionService.generateQuestionWithAI({
      lessonId: body.lessonId,
      cognitiveLevel: body.cognitiveLevel,
      questionType: body.questionType,
      score: body.score
    });

    const isMock = question.questionText.includes('theo chuẩn SGK Kết nối tri thức?') && 
      question.options?.[0]?.text?.includes('Hiện tượng tuân theo quy luật bảo toàn');

    return NextResponse.json({ 
      question,
      provider: process.env.AI_PROVIDER || 'GEMINI',
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      isMockFallback: Boolean(isMock)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
