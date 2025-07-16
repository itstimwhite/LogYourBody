import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase/clerk-client'

export async function GET(_request: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClerkSupabaseClient(() => getToken())

    // Fetch weight entries
    const { data: weights, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(30)

    if (error) {
      throw error
    }

    return NextResponse.json({
      weights: weights || [],
    })
  } catch (error) {
    console.error('Error fetching weights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClerkSupabaseClient(() => getToken())

    const { weight, unit, notes } = await request.json()

    if (!weight || !unit) {
      return NextResponse.json(
        { error: 'Weight and unit are required' },
        { status: 400 }
      )
    }

    // Convert to kg if needed
    let weightInKg = parseFloat(weight)
    if (unit === 'lbs') {
      weightInKg = weightInKg * 0.453592
    }

    // Insert weight entry
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight: weightInKg,
        weight_unit: 'kg',
        notes,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      weight: data,
    })
  } catch (error) {
    console.error('Error logging weight:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}