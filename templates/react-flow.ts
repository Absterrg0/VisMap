export const reactFlowPrompt = `<visArtifact id="react-learning-roadmap" title="React Learning Roadmap">

<visAction type="file" filePath="package.json">
{
  "name": "react-learning-roadmap",
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
    "reactflow": "^11.11.2",
    "lucide-react": "^0.509.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/node": "^20.4.2",
    "typescript": "^5.5.3",
    "eslint": "^8.57.0",
    "eslint-config-next": "latest",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
</visAction>

<visAction type="file" filePath="next.config.js">
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
</visAction>

<visAction type="file" filePath="tsconfig.json">
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
</visAction>

<visAction type="file" filePath="tailwind.config.js">
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
</visAction>

<visAction type="file" filePath="postcss.config.js">
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
</visAction>

<visAction type="file" filePath="eslint.config.js">
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Custom ESLint rules go here
  }
};
</visAction>

<visAction type="file" filePath="app/globals.css">
@tailwind base;
@tailwind components;
@tailwind utilities;
@import 'reactflow/dist/style.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

#__next {
  height: 100%;
}
</visAction>

<visAction type="file" filePath="app/layout.tsx">
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'React Learning Roadmap',
  description: 'Interactive roadmap for learning React'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full">{children}</body>
    </html>
  );
}
</visAction>

<visAction type="file" filePath="app/page.tsx">
import dynamic from 'next/dynamic';

const ReactRoadmap = dynamic(() => import('../components/ReactRoadmap'), {
  ssr: false
});

export default function HomePage() {
  return (
    <div className="h-screen w-screen">
      <ReactRoadmap />
    </div>
  );
}
</visAction>

<visAction type="file" filePath="components/ReactRoadmap.tsx">
'use client';
import { ReactFlowProvider } from 'reactflow';
import ReactFlowRenderer from './ReactFlowRenderer';

export default function ReactRoadmap() {
  return (
    <ReactFlowProvider>
      <ReactFlowRenderer />
    </ReactFlowProvider>
  );
}
</visAction>

<visAction type="file" filePath="components/ReactFlowRenderer.tsx">
'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant
} from 'reactflow';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 300, y: 100 },
    data: { label: 'JavaScript Basics' },
    style: {
      background: '#e1f5fe',
      color: '#01579b',
      border: '2px solid #0277bd'
    }
  },
  {
    id: '2',
    position: { x: 300, y: 200 },
    data: { label: 'React Fundamentals' },
    style: {
      background: '#e8f5e8',
      color: '#1b5e20',
      border: '2px solid #388e3c'
    }
  },
  {
    id: '3',
    position: { x: 150, y: 300 },
    data: { label: 'Components & Props' },
    style: {
      background: '#fff3e0',
      color: '#e65100',
      border: '2px solid #f57c00'
    }
  },
  {
    id: '4',
    position: { x: 450, y: 300 },
    data: { label: 'State & Lifecycle' },
    style: {
      background: '#fff3e0',
      color: '#e65100',
      border: '2px solid #f57c00'
    }
  },
  {
    id: '5',
    position: { x: 300, y: 400 },
    data: { label: 'React Hooks' },
    style: {
      background: '#f3e5f5',
      color: '#4a148c',
      border: '2px solid #7b1fa2'
    }
  },
  {
    id: '6',
    position: { x: 300, y: 500 },
    data: { label: 'Advanced Patterns' },
    style: {
      background: '#fce4ec',
      color: '#880e4f',
      border: '2px solid #c2185b'
    }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6', animated: true }
];

export default function ReactFlowRenderer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      className="bg-gray-50"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls />
      <MiniMap zoomable pannable />
    </ReactFlow>
  );
}
</visAction>

<visAction type="shell">
npm install && npm run dev
</visAction>

</visArtifact>`;
