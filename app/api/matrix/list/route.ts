import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function GET() {
  const matrices = localDb.getMatrices();
  return NextResponse.json({ matrices });
}
