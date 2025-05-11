export const mermaidPrompt = `<visMapArtifact id="project-import" title="Project Files"><visMapAction type="file" filePath="eslint.config.js">import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.next', 'dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {},
  }
);
</visMapAction><visMapAction type="file" filePath="package.json">{
  "name": "next-mermaid-app",
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
    "mermaid": "^10.9.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/node": "^20.4.2",
    "typescript": "^5.5.3",
    "@eslint/js": "^9.9.1",
    "typescript-eslint": "^8.3.0",
    "eslint": "^9.9.1",
    "globals": "^15.9.0"
  }
}
</visMapAction><visMapAction type="file" filePath="tsconfig.json">{
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
</visMapAction><visMapAction type="file" filePath="app/page.tsx">import dynamic from 'next/dynamic';

const Mermaid = dynamic(() => import('../components/Mermaid'), { ssr: false });

export default function HomePage() {
  const diagram = \`graph TD;
    A[Client] --> B[Next.js];
    B --> C[MermaidJS];
    C --> D[Diagram Rendered];\`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <Mermaid chart={diagram} />
    </main>
  );
}
</visMapAction><visMapAction type="file" filePath="components/Mermaid.tsx">"use client";
import { useEffect } from 'react';
import mermaid from 'mermaid';

type MermaidProps = {
  chart: string;
};

export default function Mermaid({ chart }: MermaidProps) {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);

  return <div className="mermaid">{chart}</div>;
}
</visMapAction></visMapArtifact>`;
