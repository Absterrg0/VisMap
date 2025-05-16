import { Step, StepType } from '@/types/stepType';
export interface ParsedXmlResult {
  steps: Step[];
  description: string;
  artifactTitle: string;
}

export function parseXml(response: string): Step[] {
  // Extract everything before <visArtifact ...> as intro
  const artifactStartMatch = response.match(/<visArtifact[^>]*>/);
  const artifactEndMatch = response.match(/<\/visArtifact>/);

  let intro = "";
  let outro = "";
  let xmlContent = "";

  if (artifactStartMatch && artifactEndMatch) {
    const startIdx = artifactStartMatch.index!;
    const endIdx = artifactEndMatch.index! + artifactEndMatch[0].length;

    intro = response.slice(0, startIdx).trim();
    xmlContent = response.slice(artifactStartMatch.index! + artifactStartMatch[0].length, artifactEndMatch.index!).trim();
    outro = response.slice(endIdx).trim();
  } else {
    // If no visArtifact, treat whole response as intro
    intro = response.trim();
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

  // Step 0: Introductory text
  steps.push({
    id: stepId++,
    title: "Introduction",
    description: intro,
    type: StepType.CreateFolder,
    status: "pending"
  });

  // Extract artifact title
  const titleMatch = response.match(/<visArtifact[^>]*title="([^"]*)"/);
  // Regular expression to find visAction elements
  const actionRegex = /<visAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visAction>/g;
  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;

    if (type === 'file') {
      // Check if this is an update or create operation
      const isUpdate = response.includes(`<file path="${filePath}" type="modified">`);
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

  // Step N: Outro/closing text
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