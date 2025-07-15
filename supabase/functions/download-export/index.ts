import { serve } from "https://deno.land/std@0.210.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Get token from query params
    const url = new URL(req.url)
    const token = url.searchParams.get("token")
    
    if (!token) {
      return new Response(
        "Missing download token",
        { status: 400, headers: corsHeaders }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch export data
    const { data: exportData, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('id', token)
      .single()

    if (error || !exportData) {
      return new Response(
        "Export not found or expired",
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if expired
    const expiresAt = new Date(exportData.expires_at)
    if (expiresAt < new Date()) {
      // Delete expired export
      await supabase
        .from('data_exports')
        .delete()
        .eq('id', token)
      
      return new Response(
        "Export link has expired",
        { status: 410, headers: corsHeaders }
      )
    }

    // Prepare data for download
    const format = exportData.format || 'json'
    let content: string
    let contentType: string

    if (format === 'csv') {
      content = await convertToCSV(exportData.data)
      contentType = 'text/csv'
    } else {
      content = JSON.stringify(exportData.data, null, 2)
      contentType = 'application/json'
    }

    const filename = `logyourbody-export-${new Date().toISOString().split('T')[0]}.${format}`

    // Delete the export after successful download (one-time use)
    await supabase
      .from('data_exports')
      .delete()
      .eq('id', token)

    return new Response(content, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store"
      },
      status: 200
    })
  } catch (error) {
    console.error('Download error:', error)
    return new Response(
      "Internal server error",
      { status: 500, headers: corsHeaders }
    )
  }
})

async function convertToCSV(data: any): Promise<string> {
  const csvParts: string[] = []

  // Profile CSV
  if (data.profile) {
    csvParts.push("PROFILE DATA")
    csvParts.push(objectToCSV([data.profile]))
    csvParts.push("")
  }

  // Body Metrics CSV
  if (data.bodyMetrics?.length > 0) {
    csvParts.push("BODY METRICS")
    csvParts.push(objectToCSV(data.bodyMetrics))
    csvParts.push("")
  }

  // Progress Photos CSV
  if (data.progressPhotos?.length > 0) {
    csvParts.push("PROGRESS PHOTOS")
    csvParts.push(objectToCSV(data.progressPhotos))
    csvParts.push("")
  }

  // Goals CSV
  if (data.goals?.length > 0) {
    csvParts.push("GOALS")
    csvParts.push(objectToCSV(data.goals))
  }

  return csvParts.join("\n")
}

function objectToCSV(data: any[]): string {
  if (!data || data.length === 0) return ""
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(",")
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ""
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}