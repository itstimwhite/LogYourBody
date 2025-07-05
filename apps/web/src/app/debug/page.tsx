'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Debug CSS Variables</h1>
      
      <div className="mb-8">
        <p className="mb-2">Current theme: <strong>{theme}</strong></p>
        <div className="space-x-2">
          <button 
            onClick={() => setTheme('light')} 
            className="px-4 py-2 bg-gray-200 text-black rounded"
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')} 
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Dark
          </button>
          <button 
            onClick={() => setTheme('system')} 
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            System
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>Background: <span className="bg-background px-2 py-1 rounded">--background</span></div>
        <div>Foreground: <span className="text-foreground">--foreground</span></div>
        <div>Primary: <span className="bg-primary text-primary-foreground px-2 py-1 rounded">--primary</span></div>
        <div>Secondary: <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">--secondary</span></div>
        <div>Muted: <span className="bg-muted text-muted-foreground px-2 py-1 rounded">--muted</span></div>
        <div>Accent: <span className="bg-accent text-accent-foreground px-2 py-1 rounded">--accent</span></div>
        <div>Card: <span className="bg-card text-card-foreground border px-2 py-1 rounded">--card</span></div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-900 rounded">
        <p className="text-xs font-mono">
          Check the browser console for computed CSS variable values
        </p>
      </div>
    </div>
  )
}