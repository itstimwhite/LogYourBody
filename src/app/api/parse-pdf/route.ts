import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get the PDF file from the request
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please provide a PDF file.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Dynamically import pdf-parse to avoid build issues
    const pdf = (await import('pdf-parse')).default
    
    // Parse PDF to extract text
    const pdfData = await pdf(buffer)
    const pdfText = pdfData.text

    // Check if we extracted any text
    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The PDF might be image-based or corrupted.' },
        { status: 400 }
      )
    }

    // Use OpenAI to extract body composition data
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical data extraction assistant. Extract body composition data from medical reports, DEXA scans, InBody scans, or similar documents. 
          
          Return the data in the following JSON format:
          {
            "date": "YYYY-MM-DD",
            "weight": number (in kg),
            "weight_unit": "kg" or "lbs",
            "body_fat_percentage": number,
            "muscle_mass": number (in kg),
            "bone_mass": number (in kg),
            "visceral_fat": number,
            "basal_metabolic_rate": number,
            "waist": number (in cm),
            "hip": number (in cm),
            "chest": number (in cm),
            "arms": {
              "left": number (in cm),
              "right": number (in cm)
            },
            "thighs": {
              "left": number (in cm),
              "right": number (in cm)
            },
            "notes": "any relevant notes or scan type",
            "source": "DEXA Scan" or "InBody" or "Other"
          }
          
          If a field is not present in the document, omit it from the response.
          Always try to extract the scan/measurement date if present.`
        },
        {
          role: "user",
          content: pdfText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    })

    const extractedData = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      data: extractedData,
      filename: file.name
    })

  } catch (error) {
    console.error('Error parsing PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}