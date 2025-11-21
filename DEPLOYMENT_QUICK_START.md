# Quick Start: Deploy to Vercel Now

**Time to deploy**: ~10 minutes
**Status**: Code ready ✅

---

## Your Generated Secrets

### AUTH_SECRET (for production)
```
3eQthgyDtoCcGk88naWujViTAVw8NMywQ52DS/cGLK8=
```

**⚠️ Important**: Save this value - you'll need it for Vercel environment variables!

---

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project

1. Visit: **https://vercel.com/new**
2. Click **"Import Project"**
3. Select **"polarisaistudio/chatbot"**
4. Click **"Import"**

### Step 2: Add Environment Variables

Add these **3 environment variables**:

| Name | Value | Where to Get |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` | Neon Dashboard → Connection String |
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com → API Keys |
| `AUTH_SECRET` | `3eQthgyDtoCcGk88naWujViTAVw8NMywQ52DS/cGLK8=` | Use value above |

**Note**: Leave `NEXT_PUBLIC_APP_URL` empty for now.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait ~2-3 minutes
3. Copy your deployment URL: `https://your-project-xxxxx.vercel.app`

### Step 4: Update App URL

1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://your-project-xxxxx.vercel.app` (your actual URL)
3. Go to **Deployments** → Click **"..."** → **"Redeploy"**

---

## Method 2: Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up new project? Yes
# - Project name? polaris-ai-support
# - Directory? ./
# - Override settings? No

# After deployment, add environment variables:
vercel env add DATABASE_URL
# Paste your Neon database URL

vercel env add GROQ_API_KEY
# Paste your Groq API key

vercel env add AUTH_SECRET
# Paste: 3eQthgyDtoCcGk88naWujViTAVw8NMywQ52DS/cGLK8=

# Get your deployment URL
vercel env add NEXT_PUBLIC_APP_URL
# Paste your Vercel deployment URL

# Redeploy with new env vars
vercel --prod
```

---

## After Deployment

### 1. Run Database Migrations

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migration
node scripts/migrate-db.js
```

**Expected output**:
```
🔄 Running database migrations...
✅ Created admin_users table
✅ Created feedback table
✅ Added unique constraint to conversations.session_id
✅ All migrations completed successfully!
```

### 2. Create Admin User

```bash
# Create your admin account
node scripts/create-admin.js admin@yourcompany.com YourSecurePassword123 "Your Name"
```

**Expected output**:
```
🔐 Creating admin user...
✅ Admin user created successfully!
   Email: admin@yourcompany.com
   Name: Your Name

You can now login at /admin/login
```

### 3. Test Your Deployment

Visit these URLs and verify everything works:

- ✅ **Homepage**: `https://your-project.vercel.app/`
- ✅ **Widget**: `https://your-project.vercel.app/widget`
- ✅ **Demo**: `https://your-project.vercel.app/demo`
- ✅ **Admin Login**: `https://your-project.vercel.app/admin`

### 4. Login to Admin Dashboard

1. Visit: `https://your-project.vercel.app/admin`
2. Login with your admin credentials
3. Upload test documents
4. Test chat functionality

---

## Quick Test Checklist

- [ ] Homepage loads
- [ ] Widget page shows chat interface
- [ ] Can send a message and get response
- [ ] Admin login works
- [ ] Can upload a document
- [ ] Can view conversations
- [ ] Logout works
- [ ] Multi-turn conversation works (ask follow-up question)

---

## Your Embed Code

After deployment, use this code to embed the chatbot on any website:

```html
<script src="https://your-project.vercel.app/embed.js"></script>
```

Replace `your-project.vercel.app` with your actual deployment URL.

---

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check Vercel build logs

### Can't Login to Admin
- Verify admin user was created (check database)
- Check AUTH_SECRET is set in Vercel
- Try creating a new admin user

### Widget Not Working
- Verify NEXT_PUBLIC_APP_URL is set
- Check browser console for errors
- Verify documents are uploaded and processed

---

## Need Help?

1. Check **VERCEL_DEPLOYMENT_CHECKLIST.md** for detailed steps
2. Check **DEPLOYMENT.md** for comprehensive guide
3. View Vercel logs: Dashboard → Deployments → [your deployment] → Logs
4. Check GitHub issues: https://github.com/polarisaistudio/chatbot/issues

---

## What's Deployed?

✅ AI chatbot with RAG (Retrieval-Augmented Generation)
✅ Secure admin dashboard with authentication
✅ Multi-turn conversation support
✅ Document upload and processing
✅ Conversation history viewer
✅ Embeddable widget for any website
✅ Multi-language support (English & Chinese)
✅ Streaming responses for better UX

---

## Next Steps After Deployment

1. **Upload your knowledge base documents** (FAQs, policies, product docs)
2. **Test with real queries** to verify accuracy
3. **Embed on your website** using the embed code
4. **Monitor conversations** in the admin dashboard
5. **Gather feedback** and iterate

---

**Ready to go live!** 🚀

Start with **Method 1** (Vercel Dashboard) - it's the easiest!
