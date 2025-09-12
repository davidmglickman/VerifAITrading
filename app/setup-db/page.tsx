'use client'

import { useState } from 'react'

export default function DatabaseSetupPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const setupDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to setup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E5E7'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1D1D1F',
          marginBottom: '1rem'
        }}>
          Database Setup for VerifAI Trading
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#86868B',
          marginBottom: '2rem'
        }}>
          Set up the required database tables for the watchlist functionality.
        </p>

        <button
          onClick={setupDatabase}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            backgroundColor: loading ? '#ccc' : '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2rem'
          }}
        >
          {loading ? 'Setting up...' : 'Setup Database Tables'}
        </button>

        {result && (
          <div style={{
            backgroundColor: result.success ? '#F0F9FF' : '#FEF2F2',
            border: `1px solid ${result.success ? '#BFDBFE' : '#FECACA'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: result.success ? '#1E40AF' : '#DC2626',
              marginBottom: '0.5rem'
            }}>
              {result.success ? 'Setup Instructions' : 'Error'}
            </h3>
            
            {result.success ? (
              <div>
                <p style={{ marginBottom: '1rem' }}>{result.message}</p>
                
                <h4 style={{ marginBottom: '0.5rem' }}>Next Steps:</h4>
                <ol style={{ marginBottom: '1rem' }}>
                  {result.next_steps?.map((step: string, index: number) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>{step}</li>
                  ))}
                </ol>
                
                <h4 style={{ marginBottom: '0.5rem' }}>SQL to run in Supabase:</h4>
                <textarea
                  value={result.sql_to_run}
                  readOnly
                  style={{
                    width: '100%',
                    height: '300px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '1rem',
                    backgroundColor: '#F8F9FA',
                    border: '1px solid #DEE2E6',
                    borderRadius: '4px'
                  }}
                />
                
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#FFF3CD',
                  border: '1px solid #FFEAA7',
                  borderRadius: '4px'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Instructions:</h4>
                  <ol>
                    <li>Copy the SQL above</li>
                    <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" style={{ color: '#007AFF' }}>Supabase Dashboard</a></li>
                    <li>Navigate to your project → SQL Editor</li>
                    <li>Paste and run the SQL</li>
                    <li>Return to the dashboard and test the watchlist</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#DC2626' }}>{result.error}</p>
                {result.details && (
                  <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '0.5rem' }}>
                    Details: {result.details}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{
          backgroundColor: '#F8F9FA',
          border: '1px solid #DEE2E6',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Manual Setup (Alternative)</h3>
          <p style={{ fontSize: '14px', marginBottom: '1rem' }}>
            If the automatic setup doesn't work, you can manually create the table in Supabase:
          </p>
          
          <textarea
            value={`-- VerifAI Trading Database Setup
-- Run this complete script in your Supabase SQL Editor

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing table if it exists (to start fresh)
DROP TABLE IF EXISTS public.user_watchlist CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;

-- Step 3: Create user_watchlist table with correct structure
CREATE TABLE public.user_watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  target_price DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_symbol UNIQUE(user_id, symbol)
);

-- Step 4: Create alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('price_target', 'stop_loss', 'volume_spike', 'news')) NOT NULL,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  message TEXT NOT NULL,
  is_triggered BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggered_at TIMESTAMP WITH TIME ZONE
);

-- Step 5: Create indexes for better performance
CREATE INDEX idx_user_watchlist_user_id ON public.user_watchlist(user_id);
CREATE INDEX idx_user_watchlist_symbol ON public.user_watchlist(symbol);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_symbol ON public.alerts(symbol);
CREATE INDEX idx_alerts_triggered ON public.alerts(is_triggered);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist items" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can update own watchlist items" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist items" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON public.alerts;

-- Step 8: Create RLS policies for user_watchlist
CREATE POLICY "Users can view own watchlist" ON public.user_watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items" ON public.user_watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist items" ON public.user_watchlist
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items" ON public.user_watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create RLS policies for alerts
CREATE POLICY "Users can view own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON public.alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON public.alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 12: Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_watchlist'
ORDER BY ordinal_position;

-- Step 13: Test insert (replace 'your-user-id' with actual auth.uid())
-- INSERT INTO public.user_watchlist (user_id, symbol) 
-- VALUES (auth.uid(), 'AAPL');

-- IMPORTANT: After running this script, test with a simple query:
-- SELECT * FROM public.user_watchlist WHERE user_id = auth.uid();`}
            readOnly
            style={{
              width: '100%',
              height: '400px',
              fontFamily: 'monospace',
              fontSize: '11px',
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DEE2E6',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </div>
  )
}
