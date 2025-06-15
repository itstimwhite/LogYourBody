import { NextResponse } from 'next/server'
import { createClient as createBrowserClient } from '../../../lib/supabase/client'
import { createClient as createServerClient } from '../../../lib/supabase/server'

export async function GET() {
  try {
    // Test that imports work
    const browserClientType = typeof createBrowserClient
    const serverClientType = typeof createServerClient
    
    return NextResponse.json({ 
      status: 'ok',
      imports: {
        browserClient: browserClientType === 'function',
        serverClient: serverClientType === 'function'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}