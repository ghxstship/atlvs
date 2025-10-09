# Environment Setup Guide

## Quick Setup for Development

If you're seeing 500 errors with `MIDDLEWARE_INVOCATION_FAILED`, it's likely due to missing environment variables.

### Step 1: Create Environment File

```bash
cp .env.example .env.local
```

### Step 2: Configure Required Variables

Edit `.env.local` and add the following **REQUIRED** values:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 3: Verify Setup

```bash
node scripts/check-env.js
```

This will validate that all required environment variables are set.

### Step 4: Restart Development Server

```bash
npm run dev
```

## Getting Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or select existing project
3. Go to Project Settings > API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Optional Configuration

### Stripe (for payments)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Google OAuth (for sign-in)
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Application URL
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common 500 Errors

### `MIDDLEWARE_INVOCATION_FAILED`

**Cause**: Missing Supabase environment variables

**Solution**: 
1. Ensure `.env.local` exists with valid Supabase credentials
2. Run `node scripts/check-env.js` to verify
3. Restart your development server

### Brand Configuration Errors

**Cause**: Missing brand configuration files

**Solution**: 
The application will automatically fall back to the default ghxstship brand if configurations are missing. Check console logs for warnings.

### Cookie/Header Errors

**Cause**: Attempting to access Next.js headers/cookies outside of a request context

**Solution**: 
These are now handled gracefully with try-catch blocks in the codebase.

## Troubleshooting

### Still seeing 500 errors?

1. Check browser console for detailed error messages
2. Check server console/terminal for backend errors
3. Verify database schema is up to date (run migrations if needed)
4. Clear `.next` cache: `rm -rf .next && npm run dev`

### Environment variables not loading?

- File must be named `.env.local` (not `.env`)
- Must be in the root directory of the project
- Must restart development server after changes
- In production, set variables in your hosting platform (Vercel, etc.)

## Production Deployment

For production deployments on Vercel:

1. Go to Project Settings > Environment Variables
2. Add all required variables from `.env.example`
3. Mark sensitive variables (service role keys) as "Secret"
4. Set appropriate environments (Production, Preview, Development)

## Security Notes

⚠️ **Never commit `.env.local` to version control**

- The `.gitignore` file already excludes it
- Only commit `.env.example` with dummy/placeholder values
- In production, use your hosting platform's secrets management

⚠️ **Keep service role keys secure**

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Only use it in server-side code
- Rotate keys if accidentally exposed
