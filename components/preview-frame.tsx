import { WebContainer, WebContainerProcess } from '@webcontainer/api';
import React, { useEffect, useState, useRef } from 'react';

interface PreviewFrameProps {
  webContainer: WebContainer;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [devLogs, setDevLogs] = useState<string[]>([]);
  const processRef = useRef<WebContainerProcess | null>(null);
  const hasInitialized = useRef(false);

  // Function to detect the correct dev command
  async function detectDevCommand(): Promise<string[]> {
    try {
      // Read package.json to determine the correct command
      const packageJsonContent = await webContainer.fs.readFile('/package.json', 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      console.log('Package.json scripts:', packageJson.scripts);
      
      // Check for common dev commands in order of preference
      // const possibleCommands = [
      //   ['npm', 'run', 'dev'],
      //   ['npm', 'run', 'start'],
      //   ['npm', 'start'],
      //   ['npm', 'run', 'serve'],
      //   ['npx', 'vite'],
      //   ['npx', 'next', 'dev'],
      //   ['npx', 'react-scripts', 'start'],
      // ];
      
      // Check which commands exist in package.json scripts
      if (packageJson.scripts) {
        if (packageJson.scripts.dev) {
          return ['npm', 'run', 'dev'];
        }
        if (packageJson.scripts.start) {
          return ['npm', 'run', 'start'];
        }
        if (packageJson.scripts.serve) {
          return ['npm', 'run', 'serve'];
        }
      }
      
      // Default fallback
      return ['npm', 'start'];
    } catch (err) {
      console.error('Error reading package.json:', err);
      // Fallback to common commands
      return ['npm', 'run', 'dev'];
    }
  }

  async function startDevServer() {
    if (!webContainer || hasInitialized.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setInstallLogs([]);
      setDevLogs([]);
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
          const logLine = data.toString();
          console.log('Install:', logLine);
          setInstallLogs(prev => [...prev, logLine]);
        }
      }));

      // Wait for installation to complete
      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}`);
      }

      console.log('npm install completed successfully');

      // Detect the correct dev command
      const devCommand = await detectDevCommand();
      console.log('Starting dev server with command:', devCommand.join(' '));
      
      // Start dev server and keep reference to kill it later
      try {
        processRef.current = await webContainer.spawn(devCommand[0], devCommand.slice(1));
        
        // Handle dev server output
        processRef.current.output.pipeTo(new WritableStream({
          write(data) {
            const logLine = data.toString();
            console.log('Dev server:', logLine);
            setDevLogs(prev => [...prev, logLine]);
          }
        }));

        // Handle dev server exit (in case it crashes)
        processRef.current.exit.then((exitCode: number) => {
          console.log(`Dev server process exited with code ${exitCode}`);
          if (exitCode !== 0) {
            console.error(`Dev server exited with code ${exitCode}`);
            setError(`Dev server crashed (exit code: ${exitCode}). Check logs for details.`);
            setIsLoading(false);
          }
        }).catch((err: Error) => {
          console.error('Dev server process error:', err);
          setError(`Dev server error: ${err.message}`);
          setIsLoading(false);
        });

      } catch (spawnError) {
        console.error('Error spawning dev server:', spawnError);
        
        // Try alternative commands if the first one fails
        const alternativeCommands = [
          ['npm', 'start'],
          ['npx', 'serve', '-s', 'build'],
          ['npx', 'http-server', '.', '-p', '3000'],
        ];
        
        let commandWorked = false;
        for (const altCommand of alternativeCommands) {
          try {
            console.log('Trying alternative command:', altCommand.join(' '));
            processRef.current = await webContainer.spawn(altCommand[0], altCommand.slice(1));
            
            processRef.current.output.pipeTo(new WritableStream({
              write(data) {
                const logLine = data.toString();
                console.log('Alt server:', logLine);
                setDevLogs(prev => [...prev, logLine]);
              }
            }));
            
            commandWorked = true;
            break;
          } catch (altError) {
            console.error(`Alternative command ${altCommand.join(' ')} failed:`, altError);
            continue;
          }
        }
        
        if (!commandWorked) {
          throw new Error(`Failed to start dev server. Tried multiple commands. Original error: ${spawnError}`);
        }
      }

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
    if (webContainer) {
      startDevServer();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [webContainer]);


  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 p-4">
        <div className="text-center max-w-2xl">
          <p className="mb-4 text-lg font-semibold">Error: {error}</p>
          
          {/* Show install logs if available */}
          {installLogs.length > 0 && (
            <div className="mb-4 text-left">
              <h3 className="text-sm font-semibold mb-2">Install Logs:</h3>
              <div className="bg-gray-800 p-2 rounded text-xs max-h-32 overflow-y-auto text-gray-300">
                {installLogs.slice(-10).map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show dev server logs if available */}
          {devLogs.length > 0 && (
            <div className="mb-4 text-left">
              <h3 className="text-sm font-semibold mb-2">Dev Server Logs:</h3>
              <div className="bg-gray-800 p-2 rounded text-xs max-h-32 overflow-y-auto text-gray-300">
                {devLogs.slice(-10).map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => {
              setError(null);
              hasInitialized.current = false;
              startDevServer();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="mb-2 text-lg">Starting development server...</p>
          <p className="text-sm text-gray-500 mb-4">Installing dependencies and starting dev server</p>
          
          {/* Show recent logs while loading */}
          {installLogs.length > 0 && (
            <div className="max-w-lg mx-auto text-left">
              <h3 className="text-xs font-semibold mb-1">Install Progress:</h3>
              <div className="bg-gray-800 p-2 rounded text-xs max-h-20 overflow-y-auto text-gray-300">
                {installLogs.slice(-3).map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
          
          {devLogs.length > 0 && (
            <div className="max-w-lg mx-auto text-left mt-2">
              <h3 className="text-xs font-semibold mb-1">Server Progress:</h3>
              <div className="bg-gray-800 p-2 rounded text-xs max-h-20 overflow-y-auto text-gray-300">
                {devLogs.slice(-3).map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
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