import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function GET() {
  const documents = localDb.getDocuments();
  return NextResponse.json({ documents });
}
