import { NextResponse } from 'next/server';
import { TestService } from '@/features/test-generator/test-service';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const body = await req.json();
    const { questionOrder } = body;

    if (!questionOrder || typeof questionOrder !== 'number') {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp số thứ tự câu hỏi hợp lệ (questionOrder).' },
        { status: 400 }
      );
    }

    const result = await TestService.regenerateQuestionWithAI({
      testId,
      globalOrderIndex: questionOrder
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Không thể tạo lại câu hỏi bằng AI.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      test: result.updatedTest,
      newQuestion: result.newQuestion
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Lỗi xử lý yêu cầu sinh lại câu hỏi AI.' },
      { status: 500 }
    );
  }
}
