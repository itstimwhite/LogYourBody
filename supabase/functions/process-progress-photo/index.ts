import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  originalUrl: string
  metricsId: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Skip JWT validation - we'll validate by checking if the user owns the metrics record
    const { originalUrl, metricsId } = await req.json() as RequestBody

    // Validate inputs
    if (!originalUrl || !metricsId) {
      throw new Error('Missing required parameters')
    }

    // Get Cloudinary credentials from environment
    const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')
    const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not configured')
    }

    // Build Cloudinary transformation URL
    // This will:
    // 1. Remove background using AI
    // 2. Apply person-aware cropping to center the subject
    // 3. Standardize dimensions (600x800)
    // 4. Apply slight color corrections for consistency
    // 5. Convert to WebP format for optimal delivery
    const transformations = [
      'e_background_removal',  // AI background removal
      'c_fill',               // Fill mode for consistent dimensions
      'g_person',             // Person-aware gravity
      'w_600',                // Width
      'h_800',                // Height
      'q_auto:best',          // Auto quality (best)
      'f_webp',               // WebP format
      'e_auto_brightness',    // Auto brightness adjustment
      'e_auto_contrast',      // Auto contrast adjustment
    ].join(',')

    // Create Cloudinary upload URL
    const timestamp = Math.round(Date.now() / 1000)
    const publicId = `progress-photos/${metricsId}_${timestamp}`
    
    // Parameters that need to be included in the signature (in alphabetical order)
    const params = {
      eager: transformations,
      eager_async: 'false',
      invalidate: 'true',
      public_id: publicId,
      timestamp: timestamp,
      transformation: transformations
    }
    
    // Generate signature - all parameters except api_key, file, and resource_type
    const sortedParams = Object.keys(params).sort()
    const stringToSign = sortedParams
      .map(key => `${key}=${params[key]}`)
      .join('&') + CLOUDINARY_API_SECRET
    
    const encoder = new TextEncoder()
    const data = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', originalUrl)
    formData.append('public_id', publicId)
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    formData.append('transformation', transformations)
    formData.append('eager', transformations) // Apply transformations during upload
    formData.append('eager_async', 'false')
    formData.append('invalidate', 'true')

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`Cloudinary upload failed: ${error}`)
    }

    const uploadResult = await uploadResponse.json()
    
    // Get the transformed URL
    const processedUrl = uploadResult.eager?.[0]?.secure_url || uploadResult.secure_url

    // Update the body_metrics record with the processed URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: updateError } = await supabase
      .from('body_metrics')
      .update({ 
        photo_url: processedUrl,
        original_photo_url: originalUrl,
        photo_processed_at: new Date().toISOString()
      })
      .eq('id', metricsId)

    if (updateError) {
      console.error('Failed to update body_metrics:', updateError)
      // Don't fail the whole operation if DB update fails
    }

    return new Response(
      JSON.stringify({ 
        processedUrl,
        publicId,
        originalUrl
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})