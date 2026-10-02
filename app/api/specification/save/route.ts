import { NextResponse } from 'next/server';
import { localDb } from '@/database/local-db';

export async function POST(req: Request) {
  try {
    const { specification } = await req.json();
    localDb.saveSpecification(specification);
    return NextResponse.json({ success: true, specification });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
