# Port Forwarding Guide - Run Backend Locally

## ✅ Yes! You Can Forward Your Local Port

Instead of deploying to a cloud service, you can:
1. Run your backend locally (on your computer)
2. Use a port forwarding service to expose it to the internet
3. Use that public URL in your frontend

## 🚀 Option 1: ngrok (Easiest - Recommended)

### Setup (2 minutes)

1. **Sign up** (free): https://ngrok.com
2. **Download ngrok**: https://ngrok.com/download
3. **Extract** the `ngrok.exe` file
4. **Get your authtoken** from https://dashboard.ngrok.com/get-started/your-authtoken

### Run Backend Locally

```powershell
cd "C:\Users\Computer House\Downloads\CRM"
npm run server
```

Your backend will run on `http://localhost:5000`

### Forward Port with ngrok

**In a new terminal:**
```powershell
# Authenticate (one time)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Forward port 5000
ngrok http 5000
```

You'll get a URL like: `https://abc123.ngrok-free.app`

### Update Frontend

Create `client/.env.production`:
```
REACT_APP_API_URL=https://abc123.ngrok-free.app
```

Rebuild and redeploy:
```powershell
cd client
npm run build
cd ..
firebase deploy --only hosting
```

### Free Tier Limits
- ✅ Free forever
- ✅ Random URL (changes each time you restart)
- ✅ 1 tunnel at a time
- ⚠️ URL changes when you restart ngrok

### Keep URL Stable (Paid)
- ngrok Pro: $8/month for static domain
- Or use other free options below

---

## 🌐 Option 2: Cloudflare Tunnel (Free Forever)

### Setup

1. **Install Cloudflare Tunnel**:
   ```powershell
   # Download from: https://github.com/cloudflare/cloudflared/releases
   # Or use winget:
   winget install --id Cloudflare.cloudflared
   ```

2. **Run tunnel**:
   ```powershell
   cloudflared tunnel --url http://localhost:5000
   ```

3. **Get your URL** (e.g., `https://random-name.trycloudflare.com`)

### Free Tier
- ✅ Completely free
- ✅ No signup needed
- ⚠️ URL changes each time
- ⚠️ Connection drops if inactive

---

## 🔗 Option 3: localtunnel (Free)

### Setup

1. **Install**:
   ```powershell
   npm install -g localtunnel
   ```

2. **Run**:
   ```powershell
   lt --port 5000
   ```

3. **Get your URL** (e.g., `https://random-name.loca.lt`)

### Free Tier
- ✅ Free forever
- ✅ No signup needed
- ⚠️ URL changes each time
- ⚠️ Less reliable than ngrok

---

## 🎯 Option 4: serveo.net (Free, No Install)

### Setup

Just SSH forward (if you have SSH):
```powershell
ssh -R 80:localhost:5000 serveo.net
```

### Free Tier
- ✅ No installation
- ✅ No signup
- ⚠️ Requires SSH
- ⚠️ Less reliable

---

## 📊 Comparison

| Service | Free? | Stable URL? | Reliability | Setup |
|---------|-------|-------------|-------------|-------|
| **ngrok** | ✅ Yes | ❌ No (paid) | ⭐⭐⭐⭐⭐ Best | Easy |
| **Cloudflare Tunnel** | ✅ Yes | ❌ No | ⭐⭐⭐⭐ Good | Easy |
| **localtunnel** | ✅ Yes | ❌ No | ⭐⭐⭐ OK | Easy |
| **serveo** | ✅ Yes | ❌ No | ⭐⭐ Low | Medium |

---

## 🎯 My Recommendation: ngrok

**Best for:**
- Testing/development
- Quick demos
- When you don't need a permanent URL

**Steps:**
1. Sign up: https://ngrok.com
2. Download ngrok
3. Run: `ngrok http 5000`
4. Copy the URL
5. Update frontend `.env.production`
6. Rebuild and redeploy

---

## ⚠️ Important Notes

### For Production
- **Don't use port forwarding for production**
- Use Railway, Render, or Fly.io instead
- Port forwarding is for **development/testing only**

### Why?
- URLs change when you restart
- Your computer must be on
- Less reliable
- Not suitable for real users

### For Production Use:
- **Railway** - Easiest, $5 free credit
- **Render** - Free forever
- See `RAILWAY_QUICK_START.md`

---

## Quick Start: ngrok

### 1. Install ngrok
- Download: https://ngrok.com/download
- Extract `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

### 2. Authenticate
```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken YOUR_TOKEN
```

### 3. Start Backend
```powershell
cd "C:\Users\Computer House\Downloads\CRM"
npm run server
```

### 4. Forward Port (New Terminal)
```powershell
cd C:\ngrok
.\ngrok.exe http 5000
```

### 5. Copy URL
You'll see: `Forwarding https://abc123.ngrok-free.app -> http://localhost:5000`

### 6. Update Frontend
Create `client/.env.production`:
```
REACT_APP_API_URL=https://abc123.ngrok-free.app
```

### 7. Rebuild & Deploy
```powershell
cd "C:\Users\Computer House\Downloads\CRM\client"
npm run build
cd ..
firebase deploy --only hosting
```

**Done!** Your frontend will now connect to your local backend through ngrok.

---

## Keep ngrok Running

- Keep the `ngrok http 5000` terminal open
- Keep your backend running (`npm run server`)
- If you restart ngrok, you'll get a new URL (need to update frontend)

---

## Alternative: Use Both

1. **Development**: Use ngrok for testing
2. **Production**: Deploy to Railway/Render for permanent URL

This gives you the best of both worlds! 🚀

