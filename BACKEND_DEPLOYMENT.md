# Backend Deployment Guide

## ⚠️ Firebase Hosting Cannot Run Backend

**Firebase Hosting is for static files only** (HTML, CSS, JavaScript). Your Express.js backend needs a separate hosting service.

## Quick Answer: Where to Deploy Backend?

**Recommended: Railway.app** (Free tier, easy setup)
- Go to https://railway.app
- Sign up with GitHub
- Deploy from repo
- Add environment variables
- Done!

## All Backend Hosting Options

### 🚂 Option 1: Railway (Recommended)

**Why Railway?**
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ Great for Node.js apps

**Steps:**
1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Add environment variables (see below)
7. Deploy! Your backend URL will be something like: `https://your-app.railway.app`

**Environment Variables to Add:**
```
FIREBASE_PROJECT_ID=north-6da52
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://north-6da52-default-rtdb.firebaseio.com
PORT=5000
JWT_SECRET=your-secure-random-secret
CORS_ORIGIN=https://north-6da52.web.app,https://north-6da52.firebaseapp.com
DATA_BACKEND=FIREBASE
```

### 🎨 Option 2: Render

**Why Render?**
- ✅ Free tier available
- ✅ Simple setup
- ✅ Good documentation

**Steps:**
1. Go to https://render.com
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `crm-backend` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free (or paid)
6. Add environment variables
7. Deploy!

### 🟣 Option 3: Heroku

**Why Heroku?**
- ✅ Well-established platform
- ⚠️ No free tier anymore (paid only)

**Steps:**
1. Install Heroku CLI: `npm install -g heroku-cli`
2. Login: `heroku login`
3. Create app: `heroku create your-crm-backend`
4. Set environment variables:
   ```bash
   heroku config:set FIREBASE_PROJECT_ID=north-6da52
   heroku config:set FIREBASE_CLIENT_EMAIL=...
   # ... etc
   ```
5. Deploy: `git push heroku main`

### ☁️ Option 4: Firebase Cloud Functions

**Why Cloud Functions?**
- ✅ Everything on Firebase
- ⚠️ Requires significant refactoring
- ⚠️ More complex setup

**See `FIREBASE_FUNCTIONS_GUIDE.md` for details.**

**Recommendation**: Don't do this unless you specifically want everything on Firebase. Option 1 (Railway) is much easier.

### 🐳 Option 5: DigitalOcean App Platform

**Why DigitalOcean?**
- ✅ Good performance
- ⚠️ Paid service

**Steps:**
1. Go to https://cloud.digitalocean.com
2. Create App Platform
3. Connect GitHub repo
4. Configure Node.js service
5. Add environment variables
6. Deploy!

### 🌐 Option 6: AWS / Google Cloud / Azure

These are enterprise-level options. More complex but very powerful.

## After Backend Deployment

1. **Get your backend URL** (e.g., `https://your-app.railway.app`)

2. **Update frontend environment**:
   Create `client/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-app.railway.app
   ```

3. **Rebuild and redeploy frontend**:
   ```bash
   cd client
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

## Testing Your Deployment

1. Visit your frontend: https://north-6da52.web.app
2. Try logging in
3. Check browser console for errors
4. Check backend logs on your hosting platform

## Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGIN` includes your Firebase Hosting URL
- Format: `https://north-6da52.web.app,https://north-6da52.firebaseapp.com`

### 500 Errors
- Check backend logs on hosting platform
- Verify all environment variables are set
- Check Firebase credentials are correct

### Connection Refused
- Make sure backend is running
- Check backend URL is correct in frontend `.env.production`
- Verify backend port is accessible

## Recommendation

**Use Railway.app** - it's the easiest and has a free tier. Perfect for this project!

