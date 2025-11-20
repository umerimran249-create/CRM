# Free Deployment Guide - Frontend + Backend

## ✅ Yes! You Can Deploy Both for Free

### Frontend: Firebase Hosting (Already Free)
- ✅ **100% Free** - Firebase Hosting Spark plan
- ✅ No credit card required
- ✅ HTTPS included
- ✅ Global CDN
- ✅ Already deployed at: https://north-6da52.web.app

### Backend: Choose One of These Free Options

## 🚂 Option 1: Railway (Recommended - Easiest)

**Free Tier:**
- ✅ $5 free credit per month
- ✅ Enough for small-medium apps
- ✅ No credit card required (for free tier)
- ✅ Auto-deploys from GitHub
- ✅ Easy setup

**Limitations:**
- $5 credit = ~500 hours of runtime
- After credit runs out, you need to add payment or pause

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Add environment variables
7. Deploy! (Free for first $5)

**Best for:** Getting started quickly, learning, small projects

---

## 🎨 Option 2: Render (100% Free Forever)

**Free Tier:**
- ✅ **Completely free** - no credit card needed
- ✅ Free forever (with limitations)
- ✅ Auto-deploys from GitHub
- ✅ HTTPS included

**Limitations:**
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ First request after spin-down takes ~30 seconds (cold start)
- ⚠️ 750 hours/month free (enough for always-on if you keep it active)

**Steps:**
1. Go to https://render.com
2. Sign up (free)
3. Click "New" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: `crm-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free
6. Add environment variables
7. Deploy!

**Best for:** Projects that don't need 24/7 uptime, personal projects

**Tip:** Use a service like UptimeRobot (free) to ping your backend every 10 minutes to keep it awake.

---

## 🪰 Option 3: Fly.io (Free Tier)

**Free Tier:**
- ✅ 3 shared-cpu VMs free
- ✅ 3GB persistent volumes
- ✅ 160GB outbound data transfer
- ✅ No credit card required for free tier

**Limitations:**
- More complex setup
- Need to install Fly CLI

**Steps:**
1. Install Fly CLI: `npm install -g flyctl`
2. Sign up: `flyctl auth signup`
3. Create app: `flyctl launch`
4. Deploy: `flyctl deploy`

**Best for:** More advanced users, need more control

---

## 🔄 Option 4: Cyclic (Free Tier)

**Free Tier:**
- ✅ Free forever
- ✅ Auto-deploys from GitHub
- ✅ No credit card required

**Limitations:**
- Newer platform
- Less documentation

**Steps:**
1. Go to https://cyclic.sh
2. Sign up with GitHub
3. Connect repository
4. Auto-deploys

**Best for:** Simple Node.js apps

---

## ☁️ Option 5: Firebase Functions (Free Tier)

**Free Tier:**
- ✅ 2 million invocations/month free
- ✅ 400,000 GB-seconds compute time
- ✅ Everything on Firebase

**Limitations:**
- ⚠️ **Requires refactoring** your Express app
- ⚠️ More complex setup
- ⚠️ Serverless (different architecture)

**See:** `FIREBASE_FUNCTIONS_GUIDE.md` for conversion steps

**Best for:** If you want everything on Firebase (but requires work)

---

## 📊 Comparison Table

| Platform | Free Tier | Credit Card? | Always On? | Ease of Setup |
|----------|-----------|--------------|------------|---------------|
| **Railway** | $5/month credit | No | ✅ Yes | ⭐⭐⭐⭐⭐ Easiest |
| **Render** | 750 hrs/month | No | ⚠️ Spins down | ⭐⭐⭐⭐ Easy |
| **Fly.io** | 3 VMs free | No | ✅ Yes | ⭐⭐⭐ Medium |
| **Cyclic** | Free forever | No | ✅ Yes | ⭐⭐⭐⭐ Easy |
| **Firebase Functions** | 2M invocations | No | ✅ Yes | ⭐⭐ Hard (refactor) |

---

## 🎯 My Recommendation

### For Beginners: **Railway**
- Easiest setup
- $5 free credit is enough to start
- No spin-down issues
- Great documentation

### For Long-term Free: **Render + UptimeRobot**
- Completely free forever
- Use UptimeRobot (free) to ping every 10 min to prevent spin-down
- Simple setup

### For Everything on Firebase: **Firebase Functions**
- Requires refactoring but keeps everything on one platform
- Free tier is generous

---

## 🚀 Quick Start: Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your CRM repository
5. Railway auto-detects Node.js ✅
6. Click on your service → Settings → Variables
7. Add environment variables (see below)
8. Railway auto-deploys! 🎉

**Environment Variables:**
```
FIREBASE_PROJECT_ID=north-6da52
FIREBASE_CLIENT_EMAIL=your-service-account-email@north-6da52.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your-key...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://north-6da52-default-rtdb.firebaseio.com
PORT=5000
JWT_SECRET=your-secure-random-secret-key
CORS_ORIGIN=https://north-6da52.web.app,https://north-6da52.firebaseapp.com
DATA_BACKEND=FIREBASE
```

### Step 2: Get Your Backend URL

After deployment, Railway gives you a URL like:
`https://your-app.railway.app`

### Step 3: Update Frontend

1. Create `client/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-app.railway.app
   ```

2. Rebuild and redeploy:
   ```bash
   cd client
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

### Done! ✅

Your app is now fully deployed for free:
- Frontend: https://north-6da52.web.app (Firebase Hosting - free)
- Backend: https://your-app.railway.app (Railway - $5 free credit)

---

## 💡 Keeping Render Free Forever (No Spin-down)

If you choose Render and want to keep it always-on:

1. Sign up for **UptimeRobot** (free): https://uptimerobot.com
2. Add a monitor:
   - **URL**: Your Render backend URL
   - **Type**: HTTP(s)
   - **Interval**: 5 minutes
3. UptimeRobot will ping your backend every 5 minutes
4. This keeps it awake = no spin-down! ✅

---

## 🆓 Summary: Completely Free Stack

**Frontend:** Firebase Hosting (Free)
**Backend:** Render + UptimeRobot (Both Free)
**Database:** Firebase Realtime Database (Free tier: 1GB storage, 10GB/month transfer)

**Total Cost: $0/month** 🎉

---

## Need Help?

- Railway: https://docs.railway.app
- Render: https://render.com/docs
- See `BACKEND_DEPLOYMENT.md` for detailed steps

