import { NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { QuestionItem } from '@/types/question';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body.question as QuestionItem;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Thiếu dữ liệu câu hỏi cần kiểm định.' }, { status: 400 });
    }

    const checkResult = ContextService.validateContextQuality(question);

    return NextResponse.json({
      success: true,
      result: checkResult
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
