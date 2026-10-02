import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function GET() {
  const templates = localDb.getTemplates();
  const lessons = localDb.getLessons(6).concat(
    localDb.getLessons(7),
    localDb.getLessons(8),
    localDb.getLessons(9)
  );

  return NextResponse.json({
    templates,
    lessons
  });
}
