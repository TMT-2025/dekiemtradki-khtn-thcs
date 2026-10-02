import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function GET() {
  const tests = localDb.getTests();
  return NextResponse.json({ tests });
}
