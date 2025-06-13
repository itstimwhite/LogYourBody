import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export function AuthDebugger() {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    const logEntry = `${new Date().toISOString()}: Path: ${location.pathname}, Loading: ${loading}, User: ${!!user}, Session: ${!!session}`;
    setDebugLogs(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
    console.log('AuthDebugger:', logEntry);
  }, [location.pathname, loading, user, session]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-3 rounded-lg max-w-md font-mono">
      <div className="font-bold mb-2">Auth Debug</div>
      {debugLogs.map((log, index) => (
        <div key={index} className="truncate opacity-80">
          {log}
        </div>
      ))}
    </div>
  );
}