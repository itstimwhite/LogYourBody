#!/bin/bash

# Setup Vercel environment variables for development branch

echo "Setting up Vercel environment variables for development..."

# Development environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL development < <(echo "https://blhpuaqbbczzhsshumof.supabase.co")
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaHB1YXFiYmN6emhzc2h1bW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDU4NDYsImV4cCI6MjA2NTUyMTg0Nn0.aJBhm2CtleF0N3orvzWRTbfCfTz_uV4nAqbEkHWRT8Q")

echo "Environment variables set. Triggering redeployment..."

# Trigger a new deployment
vercel --prod=false

echo "Done! Check https://dev.logyourbody.com in a few minutes."