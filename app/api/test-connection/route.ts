import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseKey,
          hasOpenAI: !!openaiKey
        }
      })
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Simple test query - just check if we can connect
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: error.message,
        config: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseKey,
          hasOpenAI: !!openaiKey
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      config: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        hasOpenAI: !!openaiKey,
        environment: process.env.NODE_ENV
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
