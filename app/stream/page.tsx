import StreamingRoadmap from '@/components/stream-component';

export default function RoadmapPage() {
  const samplePrompts = [
    { role: 'user', content: 'Create a React todo app with TypeScript' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8">Streaming Roadmap Generator</h1>
      <StreamingRoadmap
        historyId="example-123"
        prompts={samplePrompts}
        modelType="gemini"
        modelName="gemini-2.0-flash"
      />
    </div>
  );
}