import { NextRequest, NextResponse } from 'next/server';
import { processQuery } from '@/app/lib/llm-service';
import { initVectorStore } from '@/app/lib/vector-store';

// Initialize vector store
initVectorStore().catch(console.error);

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const response = await processQuery(message);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}