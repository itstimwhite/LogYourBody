import React from 'react';
import { Database } from 'lucide-react';

export function DatabaseBranchStatus() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Extract branch ID from URL
  const getBranchInfo = (url: string) => {
    if (!url) return { branch: 'Unknown', id: 'Unknown' };
    
    // Check if it's a branch URL (UUID format)
    const branchMatch = url.match(/https:\/\/([a-f0-9-]{36})\.supabase\.co/);
    if (branchMatch) {
      const branchId = branchMatch[1];
      
      // Map known branch IDs to names
      const branchMap = {
        '0fab5338-b5f2-48af-a596-591bb5b0a51c': 'main',
        '170c7ac4-6923-4c10-b560-55d3f97e1370': 'preview',
        '378a4e19-4a7d-4c2d-9f54-a28537a0e1a8': 'dev'
      } as const;
      
      const branchName = branchMap[branchId as keyof typeof branchMap] || 'unknown';
      return { branch: branchName, id: branchId };
    }
    
    // Legacy project URL
    const legacyMatch = url.match(/https:\/\/([a-z]+)\.supabase\.co/);
    if (legacyMatch) {
      return { branch: 'legacy', id: legacyMatch[1] };
    }
    
    return { branch: 'Unknown', id: 'Unknown' };
  };
  
  const { branch, id } = getBranchInfo(supabaseUrl);
  
  // Don't show in production unless it's development mode
  if (import.meta.env.PROD && branch === 'main') {
    return null;
  }
  
  const getBranchColor = (branchName: string) => {
    switch (branchName) {
      case 'main':
        return 'bg-green-600';
      case 'preview':
        return 'bg-yellow-600';
      case 'dev':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  return (
    <div className={`fixed bottom-4 left-4 ${getBranchColor(branch)} text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono flex items-center gap-2 z-50`}>
      <Database className="h-3 w-3" />
      <span>
        DB: <strong>{branch}</strong>
        <br />
        <span className="opacity-75 text-[10px]">{id.slice(0, 8)}...</span>
      </span>
    </div>
  );
}