# Deployment Guide - Polaris AI Support

This guide will help you deploy Polaris AI Support to Vercel in production.

## Prerequisites

Before deploying, make sure you have:

- ✅ GitHub repository with your code
- ✅ Vercel account (free tier works)
- ✅ Neon Postgres database (with pgvector enabled)
- ✅ Groq API key

## Step 1: Prepare Your Code

1. **Update package.json scripts** (already configured):
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

2. **Ensure .env.local is in .gitignore** (already done)

3. **Test production build locally**:
```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to verify everything works.

## Step 2: Push to GitHub

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Project"
   - Select your `chatbot` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Add Environment Variables**

   Click "Environment Variables" and add:

   | Name | Value | Where to Get |
   |------|-------|--------------|
   | `DATABASE_URL` | `postgresql://user:pass@...` | Neon Dashboard → Connection String |
   | `GROQ_API_KEY` | `gsk_xxxxx` | console.groq.com → API Keys |
   | `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Leave blank for now, update after first deploy |

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get your production URL: `https://your-project.vercel.app`

6. **Update Environment Variable**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Edit `NEXT_PUBLIC_APP_URL`
   - Set to: `https://your-project.vercel.app`
   - Redeploy (Deployments → ... → Redeploy)

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? polaris-ai-support
# - Directory? ./
# - Override settings? No

# Production deploy
vercel --prod
```

## Step 4: Post-Deployment Setup

### 1. Set Up Database (if first deploy)

The database tables should already exist from local development. If not:

```bash
# Connect to production
# Set DATABASE_URL to production value
npm run db:push
```

### 2. Upload Test Documents

1. Visit `https://your-project.vercel.app/admin`
2. Go to Documents
3. Upload a test document
4. Wait for processing

### 3. Test the Widget

Visit the demo page:
```
https://your-project.vercel.app/demo
```

Test the chat widget in the bottom-right corner.

### 4. Get Embed Code

Your embed code is now:
```html
<script src="https://your-project.vercel.app/embed.js"></script>
```

Add this to any website to show the chat widget!

## Step 5: Custom Domain (Optional)

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to Settings → Domains

2. **Add Domain**
   - Enter your domain (e.g., `support.yourcompany.com`)
   - Follow DNS configuration instructions
   - Wait for SSL certificate (automatic)

3. **Update Environment Variable**
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy

## Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
vercel logs your-project --follow

# Or in dashboard: Deployments → [deployment] → Logs
```

### Performance Monitoring

Vercel provides built-in analytics:
- Go to Analytics tab
- View page views, errors, performance

### Database Monitoring

Check Neon dashboard for:
- Connection count
- Query performance
- Storage usage

## Troubleshooting

### Build Fails

**Error: Type errors**
```bash
# Run locally
npm run type-check

# Fix errors, then commit and push
```

**Error: Missing dependencies**
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Runtime Errors

**Error: Database connection fails**
- Check `DATABASE_URL` in Vercel environment variables
- Verify Neon database is running
- Check connection string format

**Error: GROQ_API_KEY invalid**
- Verify API key in Vercel environment variables
- Check key hasn't expired at console.groq.com
- Regenerate if needed

**Error: Widget not loading**
- Check `NEXT_PUBLIC_APP_URL` is correct
- Verify CORS is configured (should work by default)
- Check browser console for errors

## Scaling Considerations

### Free Tier Limits

Vercel Free Tier:
- 100 GB-Hours compute
- 100 GB bandwidth
- Unlimited deployments

Neon Free Tier:
- 0.5 GB storage
- ~1,000 hours compute/month

Groq Free Tier:
- 14,400 requests/day
- Rate limited

### When to Upgrade

Upgrade when you hit:
- 1000+ conversations/day → Groq Pro ($0.20/1M tokens)
- 1GB+ documents → Neon Pro ($19/month)
- High traffic → Vercel Pro ($20/month)

## Security Checklist

Before going live:

- [ ] Environment variables are set (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Database credentials are secure
- [ ] API keys are rotated regularly
- [ ] Rate limiting is configured (optional)

## Continuous Deployment

Every push to `main` branch will trigger auto-deployment:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-deploys (2-3 minutes)
```

## Rollback

If something goes wrong:

1. **Via Dashboard**
   - Go to Deployments
   - Find previous working deployment
   - Click ... → Promote to Production

2. **Via CLI**
   ```bash
   vercel rollback
   ```

## Production Checklist

Before announcing to users:

- [ ] Test document upload end-to-end
- [ ] Test chat queries (English & Chinese)
- [ ] Verify widget works on test page
- [ ] Check admin dashboard loads
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring (optional)
- [ ] Prepare support documentation
- [ ] Test on mobile devices

## Support

Need help?
- 📚 [Vercel Docs](https://vercel.com/docs)
- 📚 [Next.js Deployment](https://nextjs.org/docs/deployment)
- 🐛 [GitHub Issues](https://github.com/polarisaistudio/chatbot/issues)

---

**Ready to deploy?** Start with Step 1! 🚀
