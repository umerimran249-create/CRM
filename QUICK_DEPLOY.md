# Quick Deployment Guide

## Frontend Deployment (Firebase Hosting)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Build the React App
```bash
cd client
npm run build
cd ..
```

### Step 4: Deploy
```bash
firebase deploy --only hosting
```

Your app will be live at: **https://north-6da52.web.app**

## Backend Deployment (Free Options)

⚠️ **Important**: The backend **cannot** run on Firebase Hosting. You need a separate hosting service for Node.js/Express.

### ✅ All Free Options:

1. **Railway** - $5 free credit/month (easiest, recommended)
2. **Render** - Free forever (spins down after inactivity)
3. **Fly.io** - Free tier available
4. **Cyclic** - Free forever

**See `FREE_DEPLOYMENT_GUIDE.md` for complete comparison.**

### Option 1: Railway (Recommended - Easiest, $5 free credit)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (from your `.env` file):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_DATABASE_URL`
   - `JWT_SECRET`
   - `PORT` (usually 5000)
   - `CORS_ORIGIN` (your Firebase Hosting URL)
6. Railway will auto-deploy!

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
6. Add environment variables
7. Deploy!

## Update Frontend with Backend URL

After deploying your backend, update `client/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

Then rebuild and redeploy:
```bash
cd client
npm run build
cd ..
firebase deploy --only hosting
```

## One-Command Deploy

After initial setup:
```bash
npm run deploy
```

This builds the frontend and deploys to Firebase Hosting.

## Important Notes

1. **CORS**: Make sure your backend CORS settings include your Firebase Hosting URL
2. **Environment Variables**: Never commit `.env` files to Git
3. **Firebase Rules**: Update Realtime Database security rules in Firebase Console
4. **HTTPS**: Firebase Hosting automatically provides HTTPS

## Troubleshooting

- **CORS errors**: Check backend CORS_ORIGIN setting
- **500 errors**: Check server logs and environment variables
- **403 errors**: Check Firebase Database security rules

