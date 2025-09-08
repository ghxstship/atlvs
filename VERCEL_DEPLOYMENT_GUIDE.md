# GHXSTSHIP Vercel Deployment Guide

## Quick Deployment via Vercel Dashboard

### 1. Access Vercel Dashboard
- Go to [vercel.com](https://vercel.com)
- Login with GitHub account
- Click "Add New..." → "Project"

### 2. Import Repository
- Select `ghxstship/ghxstship-saas` from your GitHub repositories
- Click "Import"

### 3. Configure Project Settings
```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: cd ../.. && pnpm build
Output Directory: .next
Install Command: cd ../.. && pnpm install
```

### 4. Environment Variables (Required)
Add these environment variables in Vercel dashboard:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL=price_individual_id
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_pro_id
NEXT_PUBLIC_STRIPE_PRICE_TEAM=price_team_id

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Observability
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Optional: Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 5. Deploy
- Click "Deploy" button
- Vercel will build and deploy your application
- You'll get a production URL like `https://ghxstship-saas.vercel.app`

### 6. Configure Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

## Monorepo Configuration

Your `vercel.json` is already configured for the monorepo structure:

```json
{
  "buildCommand": "cd ../.. && pnpm build",
  "devCommand": "cd ../.. && pnpm dev", 
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers production deployment
- Pull requests create preview deployments
- All deployments are automatic with zero downtime

## Post-Deployment Checklist

1. ✅ Verify application loads correctly
2. ✅ Test authentication (Supabase + OAuth)
3. ✅ Test Stripe integration
4. ✅ Verify all environment variables are set
5. ✅ Check cron jobs are working
6. ✅ Test all major features (Projects, People, Finance, etc.)
7. ✅ Configure custom domain if needed
8. ✅ Set up monitoring and alerts

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure monorepo configuration is correct

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify Supabase connection
- Check Stripe webhook configuration

### Performance Issues
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Optimize images and assets

## Support

- Vercel Documentation: https://vercel.com/docs
- GHXSTSHIP Issues: https://github.com/ghxstship/ghxstship-saas/issues
