import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'create_tables') {
      // Create the user_watchlist table if it doesn't exist
      const { error: watchlistError } = await supabaseAdmin.rpc('create_user_watchlist_table')
      
      if (watchlistError && !watchlistError.message.includes('already exists')) {
        console.error('Error creating watchlist table:', watchlistError)
      }
      
      // Create the alerts table if it doesn't exist
      const { error: alertsError } = await supabaseAdmin.rpc('create_alerts_table')
      
      if (alertsError && !alertsError.message.includes('already exists')) {
        console.error('Error creating alerts table:', alertsError)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Database tables created or verified',
        errors: {
          watchlist: watchlistError?.message || null,
          alerts: alertsError?.message || null
        }
      })
    }
    
    if (action === 'test_connection') {
      // Test basic database connection
      const { data, error } = await supabaseAdmin
        .from('user_watchlist')
        .select('count')
        .limit(1)
      
      return NextResponse.json({
        success: !error,
        message: error ? 'Database connection failed' : 'Database connection successful',
        error: error?.message || null,
        data
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
