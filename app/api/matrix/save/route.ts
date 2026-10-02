import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function POST(req: Request) {
  try {
    const { matrix } = await req.json();
    localDb.saveMatrix(matrix);
    return NextResponse.json({ success: true, matrix });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
