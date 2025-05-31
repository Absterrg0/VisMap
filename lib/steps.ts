import { Step, StepType } from '@/types/stepType';

export interface ParsedXmlResult {
  steps: Step[];
  description: string;
  artifactTitle: string;
}

export interface StreamingParseResult {
  newSteps: Step[];
  updatedSteps: Step[];
  processedActionCount: number;
  hasIntro: boolean;
  hasOutro: boolean;
}

// Streaming parser that can parse individual visAction blocks as they become complete
export function parseXmlStreaming(
  accumulatedContent: string, 
  lastProcessedActionCount: number = 0,
  hasProcessedIntro: boolean = false,
  existingSteps: Step[] = []
): StreamingParseResult {
  let sanitizedContent = accumulatedContent;
  
  // Sanitize content
  sanitizedContent = sanitizedContent.replace(/```[\w]*\s*/g, '');
  sanitizedContent = sanitizedContent.replace(/```\s*/g, '');
  sanitizedContent = sanitizedContent.trim();

  const newSteps: Step[] = [];
  const updatedSteps: Step[] = [];
  let stepId = Math.max(...existingSteps.map(s => s.id), 0) + 1;

  // Check for intro (only if not processed yet)
  let hasIntro = hasProcessedIntro;
  if (!hasProcessedIntro) {
    const artifactStartMatch = sanitizedContent.match(/<visArtifact[^>]*>/);
    if (artifactStartMatch) {
      const intro = sanitizedContent.slice(0, artifactStartMatch.index!).trim();
      if (intro) {
        newSteps.push({
          id: stepId++,
          title: "Introduction",
          description: intro,
          type: StepType.CreateFolder,
          status: "completed"
        });
        hasIntro = true;
      }
    }
  }

  // Find complete visAction blocks
  const completeActionRegex = /<visAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visAction>/g;
  const completeActions: Array<{type: string, filePath?: string, content: string}> = [];
  let completeMatch;
  
  while ((completeMatch = completeActionRegex.exec(sanitizedContent)) !== null) {
    const [, type, filePath, content] = completeMatch;
    completeActions.push({ type, filePath, content });
  }

  // Process newly completed actions
  const newCompleteActions = completeActions.slice(lastProcessedActionCount);
  
  // Mark all previous in-progress steps as completed when new actions are available
  existingSteps.forEach(step => {
    if (step.status === 'in-progress' && newCompleteActions.length > 0) {
      updatedSteps.push({
        ...step,
        status: 'completed'
      });
    }
  });

  // Process new complete actions
  newCompleteActions.forEach((action, index) => {
    // Only create one new in-progress step at a time
    const hasCurrentInProgress = newSteps.some(step => step.status === 'in-progress') || 
                                 existingSteps.some(step => step.status === 'in-progress' && updatedSteps.every(us => us.id !== step.id));
    
    const status = hasCurrentInProgress ? 'pending' : (index === 0 ? 'in-progress' : 'pending');

    if (action.type === 'file') {
      const isUpdate = sanitizedContent.includes(`<file path="${action.filePath}" type="modified">`);
      newSteps.push({
        id: stepId++,
        title: isUpdate ? `Update ${action.filePath || 'file'}` : `Create ${action.filePath || 'file'}`,
        description: '',
        type: isUpdate ? StepType.EditFile : StepType.CreateFile,
        status: status,
        code: action.content.trim(),
        path: action.filePath
      });
    } else if (action.type === 'shell') {
      newSteps.push({
        id: stepId++,
        title: 'Run command',
        description: '',
        type: StepType.RunScript,
        status: status,
        code: action.content.trim()
      });
    }
  });

  // Check for outro (only if visArtifact is complete)
  let hasOutro = false;
  const artifactEndMatch = sanitizedContent.match(/<\/visArtifact>/);
  if (artifactEndMatch) {
    const endIdx = artifactEndMatch.index! + artifactEndMatch[0].length;
    const outro = sanitizedContent.slice(endIdx).trim();
    if (outro && completeActions.length > 0) {
      // Mark the last step as completed if outro exists
      if (newSteps.length > 0) {
        const lastStep = newSteps[newSteps.length - 1];
        if (lastStep.status === 'in-progress') {
          lastStep.status = 'completed';
        }
      }
      
      newSteps.push({
        id: stepId++,
        title: "Conclusion",
        description: outro,
        type: StepType.CreateFolder,
        status: "completed"
      });
      hasOutro = true;
    }
  }

  return {
    newSteps,
    updatedSteps,
    processedActionCount: completeActions.length,
    hasIntro,
    hasOutro
  };
}

export function parseXml(response: string): Step[] {
  let sanitizedResponse = response;
  
  sanitizedResponse = sanitizedResponse.replace(/```[\w]*\s*/g, '');
  sanitizedResponse = sanitizedResponse.replace(/```\s*/g, '');
  
  // Trim any extra whitespace after sanitization
  sanitizedResponse = sanitizedResponse.trim();
  
  // Extract everything before <visArtifact ...> as intro
  const artifactStartMatch = sanitizedResponse.match(/<visArtifact[^>]*>/);
  const artifactEndMatch = sanitizedResponse.match(/<\/visArtifact>/);

  let intro = "";
  let outro = "";
  let xmlContent = "";

  if (artifactStartMatch && artifactEndMatch) {
    const startIdx = artifactStartMatch.index!;
    const endIdx = artifactEndMatch.index! + artifactEndMatch[0].length;

    intro = sanitizedResponse.slice(0, startIdx).trim();
    xmlContent = sanitizedResponse.slice(artifactStartMatch.index! + artifactStartMatch[0].length, artifactEndMatch.index!).trim();
    outro = sanitizedResponse.slice(endIdx).trim();
  } else {
    // If no visArtifact, treat whole response as intro
    intro = sanitizedResponse.trim();
    return [
      {
        id: 1,
        title: "Introduction",
        description: intro,
        type: StepType.CreateFolder,
        status: "pending"
      }
    ];
  }

  const steps: Step[] = [];
  let stepId = 1;

  // Step 0: Introductory text (only add if there's actual content)
  if (intro) {
    steps.push({
      id: stepId++,
      title: "Introduction",
      description: intro,
      type: StepType.CreateFolder,
      status: "pending"
    });
  }

  // Extract artifact title
  //const titleMatch = sanitizedResponse.match(/<visArtifact[^>]*title="([^"]*)"/);
  // Regular expression to find visAction elements
  const actionRegex = /<visAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visAction>/g;
  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;

    if (type === 'file') {
      // Check if this is an update or create operation
      const isUpdate = sanitizedResponse.includes(`<file path="${filePath}" type="modified">`);
      steps.push({
        id: stepId++,
        title: isUpdate ? `Update ${filePath || 'file'}` : `Create ${filePath || 'file'}`,
        description: '',
        type: isUpdate ? StepType.EditFile : StepType.CreateFile,
        status: 'pending',
        code: content.trim(),
        path: filePath
      });
    } else if (type === 'shell') {
      steps.push({
        id: stepId++,
        title: 'Run command',
        description: '',
        type: StepType.RunScript,
        status: 'pending',
        code: content.trim()
      });
    }
  }

  // Step N: Outro/closing text (only add if there's actual content)
  if (outro) {
    steps.push({
      id: stepId++,
      title: "Conclusion",
      description: outro,
      type: StepType.CreateFolder,
      status: "pending"
    });
  }

  return steps;
}

export const WORK_DIR_NAME = '/roadmap';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;

export const MODIFICATIONS_TAG_NAME = 'vis_file_modifications';