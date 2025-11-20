# ⚠️ Fix: REACT_APP_API_URL is not set!

## Quick Fix (3 Steps)

### Step 1: Deploy Backend (If Not Done)

**Railway (Easiest - 5 min):**
1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (see below)
6. **Copy your backend URL** (e.g., `https://your-app.railway.app`)

**Environment Variables for Railway:**
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

### Step 2: Create .env.production File

**In the `client/` folder**, create a file named `.env.production`:

**Windows PowerShell:**
```powershell
cd "C:\Users\Computer House\Downloads\CRM\client"
echo REACT_APP_API_URL=https://your-backend-url.railway.app > .env.production
```

**Or manually:**
1. Go to `client/` folder
2. Create new file: `.env.production`
3. Add this line (replace with your actual backend URL):
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Step 3: Rebuild and Redeploy

```powershell
cd "C:\Users\Computer House\Downloads\CRM\client"
npm run build
cd ..
firebase deploy --only hosting
```

## Done! ✅

The warning will disappear and authentication will work!

## Test

1. Visit https://north-6da52.web.app
2. Open console (F12) - warning should be gone
3. Try logging in - should work now!

## Need Your Backend URL?

If you already deployed to Railway:
- Go to https://railway.app
- Click on your project
- Click on your service
- Copy the URL from the "Settings" → "Domains" section

If you deployed to Render:
- Go to https://render.com
- Click on your service
- Copy the URL

