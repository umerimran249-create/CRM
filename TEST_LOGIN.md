# Test Login - Troubleshooting Guide

## Check What's Happening

### Step 1: Check Browser Console for Errors

1. Open https://north-6da52.web.app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for **red error messages** (not the keyboard logs - those are normal)

### Step 2: Check Network Requests

1. In Developer Tools, go to **Network** tab
2. Try to log in with:
   - Email: `admin@crm.com`
   - Password: `admin123`
3. Look for a request to `/api/auth/login`
4. Check:
   - **Status code** (should be 200 if successful, 401 if wrong credentials, 500 if server error)
   - **Response** (click on the request to see the response)

### Step 3: Test Backend Directly

Visit: `https://crm-5t0g.onrender.com/api/health`

Should return:
```json
{"status":"OK","message":"CRM API is running"}
```

### Step 4: Check if User Exists

The backend might not have any users yet. You need to create an admin user.

## Create Admin User

### Option 1: Run Script Locally

```powershell
cd "C:\Users\Computer House\Downloads\CRM"
npm run create-admin
```

This will create:
- Email: `admin@crm.com`
- Password: `admin123`

### Option 2: Check Render Logs

1. Go to https://dashboard.render.com
2. Click on your service
3. Go to **Logs** tab
4. Look for any errors when trying to log in

## Common Issues

### Issue 1: "Invalid credentials"
- **Cause**: User doesn't exist or wrong password
- **Fix**: Create admin user with `npm run create-admin`

### Issue 2: CORS Error
- **Cause**: Backend CORS not configured correctly
- **Fix**: Check `CORS_ORIGIN` in Render includes `https://north-6da52.web.app`

### Issue 3: Network Error / Failed to fetch
- **Cause**: Backend URL incorrect or backend not running
- **Fix**: 
  - Check `client/.env.production` has correct URL
  - Rebuild and redeploy frontend
  - Check backend is running on Render

### Issue 4: 500 Internal Server Error
- **Cause**: Server error (check Render logs)
- **Fix**: Check Render logs for specific error

## Quick Test

Try this in browser console (F12 → Console):

```javascript
fetch('https://crm-5t0g.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@crm.com', password: 'admin123' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact response from the backend.

## What to Share

If login still doesn't work, share:
1. **Console errors** (red messages)
2. **Network tab** - status code of `/api/auth/login` request
3. **Response** from the login API call

This will help diagnose the issue!

