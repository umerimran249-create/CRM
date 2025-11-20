# Quick Start: Run Backend Locally with ngrok

## Why This Works
- ✅ No cloud deployment needed
- ✅ Test immediately
- ✅ Free forever
- ⚠️ URL changes when you restart ngrok
- ⚠️ Your computer must be on

## Step-by-Step (5 Minutes)

### Step 1: Install ngrok

1. Go to https://ngrok.com
2. Sign up (free)
3. Download ngrok for Windows
4. Extract `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

### Step 2: Get Auth Token

1. Go to https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken

### Step 3: Authenticate ngrok

```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 4: Start Your Backend

```powershell
cd "C:\Users\Computer House\Downloads\CRM"
npm run server
```

Wait for: `Server running on port 5000`

### Step 5: Forward Port (New Terminal)

**Open a NEW PowerShell window:**

```powershell
cd C:\ngrok
.\ngrok.exe http 5000
```

You'll see something like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### Step 6: Update Frontend

Create `client/.env.production`:
```
REACT_APP_API_URL=https://abc123.ngrok-free.app
```

**Replace with your actual ngrok URL!**

### Step 7: Rebuild & Deploy Frontend

```powershell
cd "C:\Users\Computer House\Downloads\CRM\client"
npm run build
cd ..
firebase deploy --only hosting
```

## Done! ✅

Your frontend at https://north-6da52.web.app will now connect to your local backend through ngrok!

## Keep Running

- Keep `npm run server` terminal open
- Keep `ngrok http 5000` terminal open
- Both must stay running for it to work

## If You Restart ngrok

If you restart ngrok, you'll get a new URL. You'll need to:
1. Update `client/.env.production` with new URL
2. Rebuild and redeploy frontend

## Test It

1. Visit https://north-6da52.web.app
2. Try logging in
3. Check browser console - no more API URL warning!

## For Production

This is great for testing, but for production use:
- **Railway** - Permanent URL, always on
- See `RAILWAY_QUICK_START.md`

