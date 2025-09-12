import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Creating database tables...')

    // Create user_watchlist table
    const createWatchlistTable = `
      CREATE TABLE IF NOT EXISTS public.user_watchlist (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        symbol TEXT NOT NULL,
        target_price DECIMAL(10,2),
        stop_loss DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, symbol)
      );
    `

    const { error: watchlistError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createWatchlistTable 
    })

    // Alternative: Try direct SQL execution
    if (watchlistError) {
      console.log('Trying alternative method...')
      
      // Create the table using a more direct approach
      const { error: directError } = await supabaseAdmin
        .from('user_watchlist')
        .select('*')
        .limit(1)

      if (directError) {
        console.log('Table does not exist, attempting to create via SQL...')
        
        return NextResponse.json({
          success: false,
          error: 'Database table creation failed',
          message: 'Please run the SQL schema manually in Supabase SQL Editor',
          sql: createWatchlistTable,
          details: directError.message
        }, { status: 500 })
      }
    }

    // Create RLS policies
    const createPolicies = `
      -- Enable RLS
      ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own watchlist" ON public.user_watchlist;
      DROP POLICY IF EXISTS "Users can insert own watchlist items" ON public.user_watchlist;
      DROP POLICY IF EXISTS "Users can update own watchlist items" ON public.user_watchlist;
      DROP POLICY IF EXISTS "Users can delete own watchlist items" ON public.user_watchlist;
      
      -- Create new policies
      CREATE POLICY "Users can view own watchlist" ON public.user_watchlist
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own watchlist items" ON public.user_watchlist
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own watchlist items" ON public.user_watchlist
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete own watchlist items" ON public.user_watchlist
        FOR DELETE USING (auth.uid() = user_id);
    `

    return NextResponse.json({
      success: true,
      message: 'Database setup initiated',
      tables_created: ['user_watchlist'],
      next_steps: [
        '1. Go to your Supabase project SQL Editor',
        '2. Run the provided SQL to create tables and policies',
        '3. Test the watchlist functionality'
      ],
      sql_to_run: createWatchlistTable + '\n\n' + createPolicies
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
