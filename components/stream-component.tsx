/* eslint-disable */
'use client'

import { useState } from 'react';
import { Step } from '@/types/stepType';
import { StepType } from '@/types/stepType';

interface StreamingRoadmapProps {
  historyId: string;
  prompts: any[];
  modelType: string;
  modelName?: string;
}

export default function StreamingRoadmap({ 
  historyId, 
  prompts, 
  modelType, 
  modelName 
}: StreamingRoadmapProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [parsedSteps, setParsedSteps] = useState<Step[]>([]);
  const [visActions, setVisActions] = useState<any[]>([]);
  const [finalResult, setFinalResult] = useState<any>(null);

  const startGeneration = async () => {
    setIsStreaming(true);
    setRawContent('');
    setParsedSteps([]);
    setVisActions([]);
    setFinalResult(null);

  try {
      const response = await fetch('/api/streaming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          historyId,
          prompts,
          modelType,
          modelName,
          roadmapType: 'interactive'
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            switch (data.type) {
              case 'raw_chunk':
                setRawContent(prev => prev + data.content);
                break;
                
              case 'parsed_steps':
                setParsedSteps(prev => [...prev, ...data.steps]);
                break;
                
              case 'vis_actions':
                setVisActions(prev => [...prev, ...data.actions]);
                break;
                
              case 'final_result':
                setFinalResult(data);
                setParsedSteps(data.steps); // Update with final parsed steps
                break;
                
              case 'error':
                console.error('Stream error:', data.message);
                setIsStreaming(false);
                break;
                
              case 'stream_complete':
                setIsStreaming(false);
                break;
            }
          } catch (parseError) {
            console.error('Error parsing stream data:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
    }
  };

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case StepType.CreateFile: return '📄';
      case StepType.EditFile: return '✏️';
      case StepType.RunScript: return '⚡';
      case StepType.CreateFolder: return '📁';
      default: return '📋';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={startGeneration} 
          disabled={isStreaming}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-medium"
        >
          {isStreaming ? 'Generating...' : 'Generate Roadmap'}
        </button>
        
        {finalResult && (
          <div className="mt-2 text-sm text-green-600">
            ✓ Generation complete! {finalResult.steps.length} steps parsed.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Raw Stream */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Raw Stream</h3>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {rawContent || 'Waiting for stream...'}
            </pre>
          </div>
        </div>

        {/* Parsed Steps (from your parseXml function) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Parsed Steps ({parsedSteps.length})
          </h3>
          <div className="space-y-3 h-96 overflow-y-auto">
            {parsedSteps.map((step) => (
              <div key={step.id} className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getStepIcon(step.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    {step.description && (
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    )}
                    {step.path && (
                      <code className="text-xs bg-gray-100 px-1 rounded">{step.path}</code>
                    )}
                    {step.code && (
                      <pre className="bg-black text-green-400 p-2 rounded text-xs mt-2 overflow-x-auto">
                        {step.code}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VisActions (individual <visAction> blocks) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            VisActions ({visActions.length})
          </h3>
          <div className="space-y-3 h-96 overflow-y-auto">
            {visActions.map((action, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {action.type}
                  </span>
                  {action.filePath && (
                    <code className="text-xs bg-white px-1 rounded">{action.filePath}</code>
                  )}
                </div>
                <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
                  {action.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}