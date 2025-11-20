# Railway Quick Start (Easiest Deployment)

## Why Railway?
- ✅ **No verification needed** (unlike Fly.io)
- ✅ **Easiest setup** - just connect GitHub
- ✅ **Auto-detects Node.js** - no configuration needed
- ✅ **$5 free credit/month** - enough for small apps
- ✅ **Takes 5 minutes** to deploy

## Step-by-Step (5 Minutes)

### Step 1: Sign Up
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with **GitHub** (easiest)

### Step 2: Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Select your **CRM repository**
3. Railway will automatically:
   - Detect it's a Node.js app ✅
   - Start building ✅
   - Deploy ✅

### Step 3: Configure Environment Variables
1. Click on your deployed service
2. Go to **Settings** → **Variables**
3. Click **"New Variable"** and add each one:

```
FIREBASE_PROJECT_ID = north-6da52
```

```
FIREBASE_CLIENT_EMAIL = your-service-account-email@north-6da52.iam.gserviceaccount.com
```

```
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----
...your-key...
-----END PRIVATE KEY-----
```
**Important:** For the private key, paste the ENTIRE key including the BEGIN/END lines, but keep it as one line or use the format shown.

```
FIREBASE_DATABASE_URL = https://north-6da52-default-rtdb.firebaseio.com
```

```
PORT = 5000
```

```
JWT_SECRET = your-secure-random-secret-key-here
```
**Tip:** Generate a random secret: `openssl rand -base64 32` or use any random string

```
CORS_ORIGIN = https://north-6da52.web.app,https://north-6da52.firebaseapp.com
```

```
DATA_BACKEND = FIREBASE
```

### Step 4: Get Your Backend URL
1. Go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** (if not already generated)
3. Copy your URL (e.g., `https://your-app.railway.app`)

### Step 5: Update Frontend
1. Create `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-app.railway.app
   ```

2. Rebuild and redeploy:
   ```powershell
   cd client
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

## Done! ✅

Your backend is now live at: `https://your-app.railway.app`

Test it: Visit `https://your-app.railway.app/api/health`
Should return: `{"status":"OK","message":"CRM API is running"}`

## Troubleshooting

### Backend not starting?
- Check **Logs** tab in Railway dashboard
- Verify all environment variables are set correctly
- Make sure `PORT=5000` is set

### CORS errors?
- Verify `CORS_ORIGIN` includes your Firebase Hosting URLs
- Format: `https://north-6da52.web.app,https://north-6da52.firebaseapp.com`

### Need to update code?
- Just push to GitHub
- Railway auto-deploys! ✅

## Free Tier Limits

- $5 credit per month (free)
- Enough for ~500 hours of runtime
- Perfect for small-medium apps

## Next Steps

After deployment:
1. Test your backend: `https://your-app.railway.app/api/health`
2. Update frontend with backend URL
3. Redeploy frontend
4. Test login on https://north-6da52.web.app

That's it! Railway is the easiest way to deploy. 🚀

