import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_watchlist')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message,
        suggestion: 'Please run the database setup SQL first'
      }, { status: 500 })
    }

    // Test table structure by trying to select all expected columns
    const { data: testData, error: testError } = await supabase
      .from('user_watchlist')
      .select('id, user_id, symbol, added_at')
      .limit(1)

    const { data: alertsTest, error: alertsError } = await supabase
      .from('alerts')
      .select('id, user_id, symbol, alert_type, target_price, is_active, created_at')
      .limit(1)

    return NextResponse.json({
      success: true,
      tables: {
        user_watchlist: {
          accessible: !testError,
          error: testError?.message,
          expectedColumns: ['id', 'user_id', 'symbol', 'added_at'],
          testPassed: !testError
        },
        alerts: {
          accessible: !alertsError,
          error: alertsError?.message,
          expectedColumns: ['id', 'user_id', 'symbol', 'alert_type', 'target_price', 'is_active', 'created_at'],
          testPassed: !alertsError
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
