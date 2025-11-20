# Fix CORS Error

## The Problem

Your backend on Render isn't allowing requests from your frontend domain. The CORS configuration needs to include your Firebase Hosting URL.

## Quick Fix: Update CORS_ORIGIN in Render

### Step 1: Go to Render Dashboard

1. Go to https://dashboard.render.com
2. Click on your **CRM service** (crm-5t0g)
3. Go to **Environment** tab

### Step 2: Update CORS_ORIGIN Variable

Find the `CORS_ORIGIN` variable and make sure it includes:

```
https://north-6da52.web.app,https://north-6da52.firebaseapp.com
```

**Important:** 
- Must include both URLs (comma-separated)
- Must use `https://` (not `http://`)
- No spaces after commas

### Step 3: Restart Service

1. Go to **Manual Deploy** tab
2. Click **"Clear build cache & deploy"**
3. Wait for deployment to complete

## Alternative: Check Current CORS_ORIGIN

If `CORS_ORIGIN` is already set, check:
- Does it include `https://north-6da52.web.app`?
- Is it comma-separated (no spaces)?
- Are there any typos?

## Test After Fix

1. Wait for Render to redeploy
2. Refresh https://north-6da52.web.app
3. Try logging in again
4. CORS error should be gone!

## If Still Not Working

Check Render logs to see if CORS_ORIGIN is being read correctly.

