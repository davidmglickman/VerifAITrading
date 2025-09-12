# OAuth Redirect Fix - Port 4000

## Problem Identified
When logging in via Google OAuth, users were being redirected to the live server instead of staying on localhost:4000.

## Root Cause
- Multiple OAuth functions with different redirect configurations
- Missing development environment detection
- Supabase dashboard might have production URL as primary site URL

## Fixes Applied

### 1. Environment Variables Updated
Added development mode flags to `.env.local`:
```bash
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true
NEXTAUTH_URL=http://localhost:4000
APP_URL=http://localhost:4000
```

### 2. Enhanced OAuth Functions
Updated both OAuth implementations with:

**`lib/database.ts` - signInWithGoogle():**
- Added development environment detection
- Added debug logging
- Forces localhost redirects in development

**`lib/supabase.ts` - signInWithGoogle():**
- Added same development environment detection
- Changed redirect from `/dashboard` to `/auth/callback`
- Added debug logging

### 3. Debug Tools Created
- `app/auth-debug/page.tsx` - OAuth debugging tool
- Enhanced logging to track redirect URLs

## Expected Behavior Now
1. ✅ OAuth detects localhost:4000 environment
2. ✅ Forces redirect to `http://localhost:4000/auth/callback`
3. ✅ Callback page redirects to `http://localhost:4000/dashboard`
4. ✅ Debug logs show exact redirect URLs being used

## Testing
1. Visit: http://localhost:4000/auth-debug
2. Click "Debug Google OAuth" to see redirect URL calculation
3. Test actual login at: http://localhost:4000/auth/signin
4. Should stay on localhost:4000 throughout the process

## Manual Configuration Still Needed
If issues persist, update in Supabase dashboard:
- Site URL: `http://localhost:4000`
- Redirect URLs: `http://localhost:4000/auth/callback`

## Files Modified
- `.env.local` - Added development flags
- `lib/database.ts` - Enhanced OAuth with dev detection
- `lib/supabase.ts` - Fixed OAuth redirect path
- `app/auth-debug/page.tsx` - Created debug tool
