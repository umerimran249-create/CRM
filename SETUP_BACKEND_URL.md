# Fix: REACT_APP_API_URL is not set!

## The Problem
Your frontend is deployed but doesn't know where your backend is. You need to:
1. Deploy your backend (if not done yet)
2. Set the backend URL in the frontend

## Quick Fix (2 Steps)

### Step 1: Deploy Backend (If Not Done Yet)

**Option A: Railway (Easiest - 5 minutes)**

1. Go to https://railway.app
2. Sign up with GitHub (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your CRM repository
5. Railway auto-detects Node.js
6. Go to Settings → Variables
7. Add these environment variables:

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

8. Railway will auto-deploy
9. **Copy your backend URL** (e.g., `https://your-app.railway.app`)

**Option B: Render (100% Free Forever)**

1. Go to https://render.com
2. Sign up (free)
3. Click "New" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - Plan: **Free**
6. Add environment variables (same as above)
7. Deploy and get your URL

### Step 2: Set Backend URL in Frontend

1. **Create `client/.env.production` file**:

   **Windows (PowerShell):**
   ```powershell
   cd client
   echo REACT_APP_API_URL=https://your-backend-url.railway.app > .env.production
   ```

   **Windows (Command Prompt):**
   ```cmd
   cd client
   echo REACT_APP_API_URL=https://your-backend-url.railway.app > .env.production
   ```

   **Mac/Linux:**
   ```bash
   cd client
   echo "REACT_APP_API_URL=https://your-backend-url.railway.app" > .env.production
   ```

   **Or manually create the file:**
   - Create a file named `.env.production` in the `client/` folder
   - Add this line (replace with your actual backend URL):
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

2. **Rebuild the frontend:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

3. **Redeploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

## Done! ✅

After redeploying, the warning will be gone and authentication will work!

## Test It

1. Visit https://north-6da52.web.app
2. Open browser console (F12)
3. The warning should be gone
4. Try logging in - it should work now!

## Troubleshooting

### Still seeing the warning?
- Make sure you created `.env.production` in the `client/` folder (not root)
- Make sure you rebuilt (`npm run build`) after creating the file
- Make sure you redeployed to Firebase

### Backend not responding?
- Check your backend URL is correct
- Visit `https://your-backend-url.railway.app/api/health` - should return `{"status":"OK"}`
- Check backend logs on Railway/Render dashboard

### CORS errors?
- Make sure `CORS_ORIGIN` in backend includes: `https://north-6da52.web.app,https://north-6da52.firebaseapp.com`

