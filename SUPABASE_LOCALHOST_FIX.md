# 🚨 CRITICAL: Supabase Dashboard Configuration for localhost:4000

## The Problem
You're being redirected to the live site because **Supabase dashboard settings override our code**.

## ⚡ IMMEDIATE FIX REQUIRED

### 1. Supabase Dashboard Settings
Go to: https://supabase.com/dashboard/project/dkkbeklrinyzfxsckgwy

**Authentication > Settings:**

1. **Site URL:** Change from `https://trade.verifaitrust.com` to:
   ```
   http://localhost:4000
   ```

2. **Redirect URLs:** Add both:
   ```
   http://localhost:4000/auth/callback
   https://trade.verifaitrust.com/auth/callback
   ```

### 2. Google Cloud Console
Go to: https://console.cloud.google.com/apis/credentials

**OAuth 2.0 Client ID: 830828797551-psqk7acmdvu6ag5dis7da3u8eoumqi36.apps.googleusercontent.com**

**Authorized redirect URIs:** Add:
```
http://localhost:4000/auth/callback
```

## 🔧 Code Changes Made
- ✅ Added `NEXT_PUBLIC_FORCE_LOCAL_REDIRECT=true` to force localhost
- ✅ Enhanced OAuth functions with triple detection (hostname + env + force flag)
- ✅ Added aggressive console logging

## 🧪 Test After Dashboard Changes
1. Visit: http://localhost:4000/supabase-debug
2. Click "Test Supabase OAuth"
3. Check console logs - should show localhost:4000 URLs
4. Test actual login - should stay on localhost:4000

## 🎯 Expected Behavior
- OAuth should detect localhost environment
- Should force redirect to `http://localhost:4000/auth/callback`
- Should complete authentication flow on localhost:4000
- Should NOT redirect to live site

## ⚠️ WARNING
Until you change the Supabase dashboard "Site URL" setting, it will ALWAYS override our local redirectTo parameter and send you to the live site. This is a Supabase security feature that cannot be bypassed through code alone.

## 📞 If Still Having Issues
The debug tools will show exactly what's happening:
- `/supabase-debug` - See Supabase OAuth calculation
- Browser console - See "OAuth Debug (FORCED)" logs
- Network tab - See actual redirect URLs being sent
