import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function GET() {
  const grades = localDb.getGrades();
  const lessons = localDb.getLessons(6).concat(
    localDb.getLessons(7),
    localDb.getLessons(8),
    localDb.getLessons(9)
  );

  return NextResponse.json({
    grades,
    lessons
  });
}
