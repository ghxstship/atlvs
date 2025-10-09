# 🚨 QUICK FIX - 500 Error Resolution

## ⚡ Fix in 3 Commands (2 minutes)

```bash
# 1. Create environment file
cp .env.example .env.local

# 2. Edit the file and add your Supabase credentials
# (See "Get Credentials" section below)

# 3. Verify and start
npm run check:env && npm run dev
```

## 🔑 Get Supabase Credentials

1. Go to https://supabase.com
2. Sign in and open your project
3. Click: **Settings** → **API**
4. Copy these 3 values:

| Value | Where to Find | Paste Into |
|-------|--------------|------------|
| **Project URL** | Project URL field | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | anon / public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | service_role key (click reveal) | `SUPABASE_SERVICE_ROLE_KEY` |

## 📝 Your `.env.local` File Should Look Like This

```bash
# Required - Copy from Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Can leave blank for now
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## ✅ Verify It's Working

Run this command:
```bash
npm run check:env
```

**Good output** (all ✅):
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
✅ SUPABASE_SERVICE_ROLE_KEY
✅ All required environment variables are set!
```

**Bad output** (any ❌):
```
❌ MISSING REQUIRED: NEXT_PUBLIC_SUPABASE_URL
```
→ Go back and add the missing values to `.env.local`

## 🚀 Start the App

```bash
npm run dev
```

Or use safe mode (auto-checks environment first):
```bash
npm run dev:safe
```

## ❓ Don't Have a Supabase Project?

### Create a Free Project (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub/Google
4. Click "New project"
5. Fill in:
   - **Name**: `ghxstship-dev` (or any name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2 minutes for setup
8. Follow "Get Credentials" section above

## 🆘 Still Having Issues?

### Check These Common Problems

**Problem**: File not found error  
**Fix**: Make sure you're in the ATLVS directory
```bash
cd /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ATLVS
```

**Problem**: Environment variables not loading  
**Fix**: Make sure file is named `.env.local` (not `.env`)
```bash
ls -la | grep env
# Should show: .env.local
```

**Problem**: Still seeing 500 errors after setup  
**Fix**: Restart the dev server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## 📚 More Help

- **Detailed Guide**: `ENVIRONMENT_SETUP.md`
- **Full Fix Documentation**: `500_ERROR_FIXES.md`
- **Summary**: `500_ERROR_RESOLUTION_SUMMARY.md`

## 🎯 What This Fixes

✅ Resolves `MIDDLEWARE_INVOCATION_FAILED` 500 errors  
✅ Enables authentication and user management  
✅ Enables database operations  
✅ Allows the app to run properly  

---

**Need help?** All fixes are already implemented in the codebase. You just need to configure the environment variables.
