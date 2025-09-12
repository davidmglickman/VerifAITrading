import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_watchlist')
      .select('*')
      .limit(1)
    
    if (connectionError) {
      console.error('Database connection error:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message,
        suggestion: 'Check if Supabase tables exist and RLS policies are configured'
      }, { status: 500 })
    }
    
    // Test table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'user_watchlist' })
      .single()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      connectionTest: connectionTest || [],
      tableExists: !tableError,
      tableError: tableError?.message || null
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
