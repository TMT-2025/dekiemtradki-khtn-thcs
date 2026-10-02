import { NextRequest, NextResponse } from 'next/server';
import { ContextService } from '@/features/context-engine/context-service';
import { GradeLevel, SubjectArea, ContentDomain } from '@/types/curriculum';
import { ContextScope, ApplicationDomain, ContextComplexity } from '@/types/context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') ? (parseInt(searchParams.get('grade')!, 10) as GradeLevel) : undefined;
    const subjectArea = (searchParams.get('subjectArea') as SubjectArea) || undefined;
    const contentDomain = (searchParams.get('contentDomain') as ContentDomain) || undefined;
    const contextScope = (searchParams.get('scope') || searchParams.get('contextType')) as ContextScope || undefined;
    const applicationDomain = (searchParams.get('domain') || searchParams.get('applicationArea')) as ApplicationDomain || undefined;
    const contextLevel = (searchParams.get('level') || searchParams.get('complexity')) as ContextComplexity || undefined;
    const keyword = searchParams.get('search') || searchParams.get('keyword') || undefined;

    const phenomena = ContextService.filterPhenomena({
      grade,
      subjectArea,
      contentDomain,
      contextType: contextScope,
      applicationArea: applicationDomain,
      contextLevel,
      keyword
    });

    const stimuli = ContextService.getStimuli();

    return NextResponse.json({
      success: true,
      total: phenomena.length,
      data: phenomena,
      stimuli
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.phenomenon_id || body.title) {
      const p = {
        phenomenon_id: body.phenomenon_id || `PHENOM_${Date.now()}`,
        title: body.title,
        description: body.description || '',
        grade: body.grade || 6,
        topic: body.topic || '',
        subject_area: body.subject_area || 'PHYSICS',
        content_domain: body.content_domain || 'ENERGY',
        context_type: body.context_type || 'PERSONAL',
        application_area: body.application_area || 'DAILY_LIFE',
        context_level: body.context_level || 'C1',
        difficulty: body.difficulty || 'MEDIUM',
        stimulus: body.stimulus,
        source: body.source || 'THCS KHTN',
        source_country: body.source_country || 'Việt Nam',
        source_language: body.source_language || 'vi',
        age_range: body.age_range || '11-15 tuổi',
        curriculum_alignment: body.curriculum_alignment || ''
      };
      ContextService.savePhenomenon(p);
      return NextResponse.json({ success: true, data: p }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Dữ liệu bối cảnh không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
