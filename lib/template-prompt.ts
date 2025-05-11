import { mermaidPrompt } from "@/templates/mermaid";

import { reactFlowPrompt } from "@/templates/react-flow";
import { BASE_PROMPT } from "./prompts-llm";

export const templatePrompt = (roadmapType: 'static' | 'dynamic') => [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${roadmapType === 'static' ? mermaidPrompt : reactFlowPrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`]     