import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState, useRef } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processRef = useRef<any>(null);
  const hasInitialized = useRef(false);

  async function startDevServer() {
    if (!webContainer || hasInitialized.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      hasInitialized.current = true;

      // Set up server-ready listener BEFORE starting processes
      webContainer.on('server-ready', (port, url) => {
        console.log(`Server ready on port ${port}: ${url}`);
        setUrl(url);
        setIsLoading(false);
      });

      // Install dependencies
      console.log('Installing dependencies...');
      const installProcess = await webContainer.spawn('npm', ['install']);

      // Handle install output
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('Install:', data);
        }
      }));

      // Wait for installation to complete
      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}`);
      }

      console.log('Starting dev server...');
      
      // Start dev server and keep reference to kill it later
      processRef.current = await webContainer.spawn('npm', ['run', 'dev']);

      // Handle dev server exit (in case it crashes)
      processRef.current.exit.then((exitCode:number) => {
        if (exitCode !== 0) {
          console.error(`Dev server exited with code ${exitCode}`);
          setError(`Dev server crashed (exit code: ${exitCode})`);
          setIsLoading(false);
        }
      });

    } catch (err) {
      console.error('Error starting dev server:', err);
      setError(err instanceof Error ? err.message : 'Failed to start dev server');
      setIsLoading(false);
      hasInitialized.current = false;
    }
  }

  // Cleanup function to kill processes
  const cleanup = async () => {
    if (processRef.current) {
      try {
        await processRef.current.kill();
        processRef.current = null;
      } catch (err) {
        console.error('Error killing process:', err);
      }
    }
  };

  useEffect(() => {
    if (webContainer && files.length > 0) {
      startDevServer();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [webContainer, files]); // Added dependencies

  // Restart server when files change significantly
  useEffect(() => {
    if (hasInitialized.current && files.length > 0) {
      // Optionally restart server when files change
      // You might want to debounce this or only restart on package.json changes
      console.log('Files changed, consider restarting server if needed');
    }
  }, [files]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        <div className="text-center">
          <p className="mb-2">Error: {error}</p>
          <button 
            onClick={() => {
              setError(null);
              hasInitialized.current = false;
              startDevServer();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="mb-2">Starting development server...</p>
          <p className="text-sm text-gray-500">Installing dependencies and starting dev server</p>
        </div>
      )}
      
      {url && !isLoading && (
        <iframe 
          width="100%" 
          height="100%" 
          src={url}
          className="border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      )}
      
      {!url && !isLoading && !error && (
        <div className="text-center">
          <p className="mb-2">Waiting for files...</p>
          <p className="text-sm text-gray-500">Add some files to start the preview</p>
        </div>
      )}
    </div>
  );
}