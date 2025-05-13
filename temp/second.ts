import { Project } from "@/types/types";

export const sampleProjects: Project[] = [
    {
      id: "1",
      name: "Personal Assistant",
      chats: [
        { id: "1-1", name: "Travel Planning", lastUpdated: new Date() },
        { id: "1-2", name: "Meal Prep Ideas", lastUpdated: new Date() },
        { id: "1-3", name: "Workout Routine", lastUpdated: new Date() },
      ],
    },
    // ... other projects
  ]
  



  export const prompt = `I'll create a roadmap visualization for a simple todo list application using Mermaid.js, focusing on clear and maintainable code with a visually appealing design.
  
  \`\`\`xml
  <visArtifact id="todo-app-roadmap" title="Todo Application Roadmap">
    <visAction type="file" filePath="package.json">
      {
        "name": "todo-app-roadmap",
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
          "mermaid": "^10.9.0",
          "lucide-react": "^0.344.0"
        },
        "devDependencies": {
          "@types/react": "^18.3.5",
          "@types/node": "^20.4.2",
          "typescript": "^5.5.3",
          "@eslint/js": "^9.9.1",
          "typescript-eslint": "^8.3.0",
          "eslint": "^9.9.1",
          "globals": "^15.9.0",
          "tailwindcss": "^3.4.1",
          "postcss": "^8.4.35",
          "autoprefixer": "^10.4.17"
        }
      }
    </visAction>
    <visAction type="file" filePath="postcss.config.js">
      module.exports = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      }
    </visAction>
    <visAction type="file" filePath="tailwind.config.ts">
      import type { Config } from 'tailwindcss'
  
      const config: Config = {
        content: [
          './pages/**/*.{js,ts,jsx,tsx,mdx}',
          './components/**/*.{js,ts,jsx,tsx,mdx}',
          './app/**/*.{js,ts,jsx,tsx,mdx}',
        ],
        theme: {
          extend: {
            backgroundImage: {
              'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
              'gradient-conic':
                'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
          },
        },
        plugins: [],
      }
      export default config
    </visAction>
    <visAction type="file" filePath="components/TodoRoadmap.tsx">
      "use client";
      import { useEffect } from 'react';
      import mermaid from 'mermaid';
  
      export default function TodoRoadmap() {
        useEffect(() => {
          mermaid.initialize({ startOnLoad: true });
          mermaid.contentLoaded();
        }, []);
  
        return (
          <div className="mermaid">
            {\`graph TD
              A[Plan the App] --> B[Design UI]
              B --> C[Implement Core Features]
              C --> D[Add Data Persistence]
              D --> E[Implement User Authentication]
              E --> F[Test the App]
              F --> G[Deploy the App]
  
              subgraph Planning
                A1[Define Requirements] --> A2[Choose Tech Stack]
                A2 --> A3[Set Up Project]
              end
  
              subgraph UI Design
                B1[Wireframes] --> B2[Mockups]
                B2 --> B3[Prototype]
              end
  
              subgraph Core Features
                C1[Add Tasks] --> C2[View Tasks]
                C2 --> C3[Edit Tasks]
                C3 --> C4[Delete Tasks]
              end
  
              subgraph Data Persistence
                D1[Local Storage] --> D2[Backend API]
              end
  
              subgraph User Authentication
                E1[Sign-up] --> E2[Login]
                E2 --> E3[Logout]
              end
  
              A --> A1
              B --> B1
              C --> C1
              D --> D1
              E --> E1
            \`}
          </div>
        );
      }
    </visAction>
    <visAction type="file" filePath="app/page.tsx">
      import TodoRoadmap from '../components/TodoRoadmap';
      import { CheckCircle2, ListChecks } from 'lucide-react';
  
      export default function HomePage() {
        return (
          <main className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
              <div className="bg-white shadow-md rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <ListChecks className="text-blue-500 mr-2 w-6 h-6" />
                  <h1 className="text-2xl font-bold text-gray-800">
                    Todo Application Development Roadmap
                  </h1>
                </div>
                <p className="text-gray-600 mb-8">
                  This roadmap outlines the key steps in developing a simple todo
                  application, from planning to deployment.
                </p>
                <TodoRoadmap />
                <div className="mt-8 flex justify-center">
                  <a
                    href="https://unsplash.com/photos/a-pile-of-books-lying-on-a-table-PTAmVvVbCAY"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" />
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </main>
        );
      }
    </visAction>
    <visAction type="shell">
      npm install
      npm run dev
    </visAction>
  </visArtifact>
  \`\`\``