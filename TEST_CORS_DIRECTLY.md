# Test CORS Directly

## The Issue

Even after deployment, CORS is still failing. Let's test if the backend is actually responding to OPTIONS requests.

## Test 1: Check if OPTIONS Works

**In browser console (F12 → Console), run:**

```javascript
fetch('https://crm-5t0g.onrender.com/api/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://north-6da52.web.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type,Authorization'
  }
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:');
  r.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
  return r.text();
})
.then(console.log)
.catch(err => console.error('Error:', err));
```

**What to look for:**
- Status should be 200
- Should see `Access-Control-Allow-Origin: *` in headers
- Should see `Access-Control-Allow-Methods` header

## Test 2: Check Render Logs

1. Go to https://dashboard.render.com
2. Your service → **Logs** tab
3. Try to login from frontend
4. Look for log messages:
   - `OPTIONS /api/auth/login - Origin: https://north-6da52.web.app`
   - `Handling OPTIONS preflight request`

**If you don't see these logs, the OPTIONS request isn't reaching the server.**

## Test 3: Check if Render is Blocking

Render might be blocking OPTIONS requests at the proxy level. Check:
1. Render dashboard → Your service → **Settings**
2. Look for any proxy/load balancer settings
3. Check if there are any firewall rules

## Test 4: Try Direct POST (Bypass Preflight)

Some browsers cache preflight failures. Try:

```javascript
fetch('https://crm-5t0g.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## If OPTIONS Returns 200 But Still Fails

This means:
- Backend is working
- Browser is caching the old CORS error
- **Solution**: Clear browser cache completely or use incognito mode

## If OPTIONS Returns Error

This means:
- Backend isn't handling OPTIONS correctly
- Render might be blocking it
- Check Render logs for errors

## Next Steps

1. Run Test 1 above
2. Check Render logs (Test 2)
3. Share the results

The latest code should handle OPTIONS correctly. If it's still failing, it might be a Render proxy issue or browser caching.

