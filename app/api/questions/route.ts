import { NextResponse } from 'next/server';
import { QuestionService } from '@/features/question-bank/question-service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get('grade') ? (Number(searchParams.get('grade')) as any) : undefined;
  const keyword = searchParams.get('keyword') || undefined;

  const questions = QuestionService.getQuestions({ grade, keyword });
  return NextResponse.json({ questions });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const success = QuestionService.deleteQuestion(id);
  return NextResponse.json({ success });
}
