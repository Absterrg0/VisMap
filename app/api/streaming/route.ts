import { NextRequest } from 'next/server';
import { generateRoadmap } from '@/app/actions/llms/roadmap';

export async function POST(request: NextRequest) {
  try {
    const { historyId, prompts, modelType, modelName, roadmapType } = await request.json();
    
    const stream = await generateRoadmap(
      historyId,
      prompts,
      modelType,
      modelName,
      roadmapType
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start stream' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}