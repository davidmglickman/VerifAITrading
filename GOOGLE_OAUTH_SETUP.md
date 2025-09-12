# Google OAuth Setup Instructions

## The Google OAuth button isn't working because:

### 1. **Supabase Configuration Missing**
You need to configure Google OAuth in your Supabase dashboard:

1. Go to: https://dkkbeklrinyzfxsckgwy.supabase.co/project/default/auth/providers
2. Click on "Google" provider
3. Enable Google OAuth
4. Add your Google Client ID: `YOUR_GOOGLE_CLIENT_ID_HERE`
5. Add your Google Client Secret: `YOUR_GOOGLE_CLIENT_SECRET_HERE`

### 2. **Google Console Configuration**
In your Google Cloud Console, add these redirect URIs:
- `https://dkkbeklrinyzfxsckgwy.supabase.co/auth/v1/callback`
- `http://localhost:3003/auth/callback` (for local development)

### 3. **Current Workaround**
For now, the Google button will show a demo dialog and redirect to dashboard.

### 4. **To Fix Completely**
1. Complete the Supabase OAuth setup above
2. Update the signInWithGoogle function to use the real OAuth URL
3. Test with: `https://dkkbeklrinyzfxsckgwy.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3003/dashboard`

## Alternative: Email/Password Authentication
The email/password sign-in should work perfectly since it uses the direct Supabase auth API.
