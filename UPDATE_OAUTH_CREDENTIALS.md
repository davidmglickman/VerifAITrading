# Update OAuth Credentials

## Current Issue
The Google OAuth client was deleted, causing error: `Error 401: deleted_client`

## Steps to Fix

### 1. Create New Google OAuth Client
Go to: https://console.cloud.google.com/apis/credentials

**Authorized redirect URIs to add:**
```
https://dkkbeklrinyzfxsckgwy.supabase.co/auth/v1/callback
https://verif-ai-trading-mo50o7e1e-davids-projects-44837990.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 2. Once you have new credentials, run these commands:

```bash
# Update local environment
# Replace YOUR_NEW_CLIENT_ID and YOUR_NEW_CLIENT_SECRET with actual values

# Update Vercel environment variables
npx vercel env rm GOOGLE_CLIENT_ID
npx vercel env add GOOGLE_CLIENT_ID production
# Enter your new client ID when prompted

npx vercel env rm GOOGLE_CLIENT_SECRET  
npx vercel env add GOOGLE_CLIENT_SECRET production
# Enter your new client secret when prompted

# Deploy with new credentials
npx vercel --prod
```

### 3. Update Supabase Dashboard
Go to: https://dkkbeklrinyzfxsckgwy.supabase.co/project/default/auth/providers
- Enable Google provider
- Add your new Client ID and Client Secret

### 4. Test the OAuth flow
Visit your deployed app and try signing in with Google.

## Current Credentials (EXAMPLE - REPLACE WITH YOUR OWN)
- Client ID: YOUR_GOOGLE_CLIENT_ID_HERE
- Client Secret: YOUR_GOOGLE_CLIENT_SECRET_HERE
