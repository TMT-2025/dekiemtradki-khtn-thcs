import { NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { GradeLevel } from '@/types/curriculum';
import { ApplicationArea, ContextType, ContextLevel } from '@/types/context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeStr = searchParams.get('grade');
    const grade = gradeStr ? (parseInt(gradeStr, 10) as GradeLevel) : undefined;
    const applicationArea = (searchParams.get('applicationArea') as ApplicationArea) || undefined;
    const contextType = (searchParams.get('contextType') as ContextType) || undefined;
    const contextLevel = (searchParams.get('contextLevel') as ContextLevel) || undefined;
    const organization = searchParams.get('organization') || undefined;
    const keyword = searchParams.get('keyword') || undefined;

    const items = ContextService.filterInternationalContexts({
      grade,
      applicationArea,
      contextType,
      contextLevel,
      organization,
      keyword
    });

    return NextResponse.json({
      success: true,
      total: items.length,
      data: items
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
