import { NextResponse } from 'next/server';
import { isVectorStoreInitialized } from '@/app/lib/vector-store';

export async function GET() {
  return NextResponse.json({ isReady: await isVectorStoreInitialized() });
}