# PDF Parsing Setup Guide

The LogYourBody app supports parsing PDF files from DEXA scans, InBody reports, and other body composition documents using OpenAI's API.

## Prerequisites

To use the PDF parsing feature, you need:
1. An OpenAI API account
2. An API key from OpenAI

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key (it starts with `sk-`)

### 2. Add the API Key to Your Environment

#### For Local Development

Add the following to your `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

#### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add a new variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-api-key-here`
   - Environment: Production, Preview, Development

### 3. Restart Your Application

After adding the environment variable:
- For local development: Restart your development server
- For Vercel: Redeploy your application

## Supported PDF Types

The PDF parser can extract data from:
- DEXA scan reports
- InBody analysis reports
- BodPod results
- Other body composition analysis documents

## Extracted Data

The parser attempts to extract:
- Measurement date
- Weight
- Body fat percentage
- Muscle mass
- Bone mass
- Visceral fat rating
- Basal metabolic rate
- Body measurements (waist, hip, chest, arms, thighs)

## Troubleshooting

### "PDF parsing requires an OpenAI API key"
- Ensure you've added the `OPENAI_API_KEY` to your environment variables
- Check that the key is correctly formatted (starts with `sk-`)
- Restart your application after adding the key

### "Could not extract text from PDF"
- The PDF might be image-based (scanned document)
- Try using a PDF with selectable text
- Consider using OCR software to convert image PDFs to text PDFs first

### "Rate limit exceeded"
- OpenAI has rate limits on API usage
- Wait a few moments before trying again
- Consider upgrading your OpenAI plan for higher limits

## Cost Considerations

- PDF parsing uses OpenAI's GPT-4o-mini model
- Each PDF parse costs approximately $0.001-0.005 depending on document size
- Monitor your OpenAI usage dashboard to track costs

## Alternative: Manual Entry

If you don't want to set up OpenAI API:
1. Use the manual log entry form
2. Enter your body composition data directly
3. Or use CSV import for bulk data entry