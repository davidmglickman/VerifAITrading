# Port 4000 Redirect Configuration Guide

## Current Status
✅ Environment variables updated to use port 4000
✅ Auth functions use dynamic `window.location.origin`
✅ Development server running on port 4000

## Google OAuth Configuration Required

### 1. Google Cloud Console Setup
You need to update your Google OAuth application to allow port 4000:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"  
3. Find your OAuth 2.0 Client ID: `830828797551-psqk7acmdvu6ag5dis7da3u8eoumqi36.apps.googleusercontent.com`
4. Click "Edit" on the OAuth 2.0 Client ID
5. In "Authorized redirect URIs", add:
   ```
   http://localhost:4000/auth/callback
   ```
6. Save the changes

### 2. Supabase Configuration
In your Supabase dashboard:

1. Go to Authentication > Settings
2. In "Site URL", add or verify:
   ```
   http://localhost:4000
   ```
3. In "Redirect URLs", add:
   ```
   http://localhost:4000/auth/callback
   ```

### 3. Test Authentication
After updating both configurations:

1. Visit: http://localhost:4000/test-auth
2. Click "Test Google OAuth"
3. Should redirect properly to Google and back

## Current Environment Variables
```bash
NEXTAUTH_URL=http://localhost:4000
APP_URL=http://localhost:4000
GOOGLE_CLIENT_ID=830828797551-psqk7acmdvu6ag5dis7da3u8eoumqi36.apps.googleusercontent.com
```

## Files Updated
- ✅ `.env.local` - Updated URLs to port 4000
- ✅ `app/test-auth/page.tsx` - Created test page
- ✅ Auth functions already use dynamic origin detection

## Next Steps
1. Update Google OAuth settings (manual step)
2. Update Supabase settings (manual step)  
3. Test authentication flow
4. Remove test page when confirmed working
