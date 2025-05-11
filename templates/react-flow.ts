export const reactFlowPrompt = `<visMapArtifact id="project-import" title="Project Files">
<visMapAction type="file" filePath="package.json">{
  "name": "next-react-flow-app",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "latest",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "reactflow": "^11.11.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/node": "^20.4.2",
    "typescript": "^5.5.3",
    "eslint": "^9.9.1"
  }
}
</visMapAction>

<visMapAction type="file" filePath="tsconfig.json">{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
</visMapAction>

<visMapAction type="file" filePath="app/page.tsx">"use client";

import dynamic from "next/dynamic";

const Flow = dynamic(() => import("../components/Flow"), { ssr: false });

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Flow />
    </main>
  );
}
</visMapAction>

<visMapAction type="file" filePath="components/Flow.tsx">"use client";

import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const nodes = [
  {
    id: "1",
    data: { label: "Client" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    data: { label: "Next.js" },
    position: { x: 150, y: 100 },
  },
  {
    id: "3",
    data: { label: "React Flow" },
    position: { x: 300, y: 0 },
  },
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export default function Flow() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
</visMapAction>
</visMapArtifact>`;
