import { NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { GradeLevel, SubjectArea, ContentDomain } from '@/types/curriculum';
import { ContextType, ApplicationArea, ContextLevel } from '@/types/context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeStr = searchParams.get('grade');
    const grade = gradeStr ? (parseInt(gradeStr, 10) as GradeLevel) : undefined;
    const subjectArea = (searchParams.get('subjectArea') as SubjectArea) || undefined;
    const contentDomain = (searchParams.get('contentDomain') as ContentDomain) || undefined;
    const contextType = (searchParams.get('contextType') as ContextType) || undefined;
    const applicationArea = (searchParams.get('applicationArea') as ApplicationArea) || undefined;
    const contextLevel = (searchParams.get('contextLevel') as ContextLevel) || undefined;
    const keyword = searchParams.get('keyword') || undefined;

    const phenomena = ContextService.filterPhenomena({
      grade,
      subjectArea,
      contentDomain,
      contextType,
      applicationArea,
      contextLevel,
      keyword
    });

    return NextResponse.json({
      success: true,
      total: phenomena.length,
      data: phenomena
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
