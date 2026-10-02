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
    const contextType = searchParams.get('contextType') as ContextScope || undefined;
    const applicationArea = searchParams.get('applicationArea') as ApplicationDomain || undefined;
    const contextLevel = searchParams.get('contextLevel') as ContextComplexity || undefined;
    const keyword = searchParams.get('keyword') || searchParams.get('search') || undefined;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ success: false, error: 'Tiêu đề và mô tả hiện tượng là bắt buộc' }, { status: 400 });
    }

    const newPhenom = {
      phenomenon_id: body.phenomenon_id || `PHENOM_${Date.now()}`,
      title: body.title,
      description: body.description,
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
      source_url: body.source_url,
      source_country: body.source_country || 'Việt Nam',
      source_language: body.source_language || 'vi',
      age_range: body.age_range || '11-15 tuổi',
      curriculum_alignment: body.curriculum_alignment || ''
    };

    ContextService.savePhenomenon(newPhenom);

    return NextResponse.json({
      success: true,
      data: newPhenom
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
