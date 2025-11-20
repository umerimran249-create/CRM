# Deploy Backend to Fly.io (Free Tier)

## ✅ Fly.io CLI Installed!

**Note:** If `flyctl` command is not found, add it to your PATH or use the full path:
```powershell
# Add to PATH for current session
$env:Path += ";C:\Users\Computer House\.fly\bin"

# Or use full path
C:\Users\Computer House\.fly\bin\flyctl.exe --version
```

## Step 1: Sign Up / Login

```powershell
flyctl auth signup
```

Or if you already have an account:
```powershell
flyctl auth login
```

## Step 2: Navigate to Project Root

```powershell
cd "C:\Users\Computer House\Downloads\CRM"
```

## Step 3: Initialize Fly.io App

```powershell
flyctl launch
```

This will:
- Ask for app name (or auto-generate one)
- Ask for region (choose closest to you)
- Ask if you want a Postgres database (say **No** - we're using Firebase)
- Ask if you want a Redis database (say **No**)
- Create `fly.toml` configuration file

## Step 4: Configure fly.toml

After `flyctl launch`, edit the generated `fly.toml` file:

```toml
app = "your-app-name"
primary_region = "iad"  # or your chosen region

[build]

[env]
  PORT = "5000"
  FIREBASE_PROJECT_ID = "north-6da52"
  FIREBASE_DATABASE_URL = "https://north-6da52-default-rtdb.firebaseio.com"
  DATA_BACKEND = "FIREBASE"
  JWT_SECRET = "your-secure-random-secret-key"
  CORS_ORIGIN = "https://north-6da52.web.app,https://north-6da52.firebaseapp.com"

[http_service]
  internal_port = 5000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  protocol = "tcp"
  internal_port = 5000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

## Step 5: Set Sensitive Environment Variables

**Important:** Don't put sensitive data in `fly.toml`. Use `flyctl secrets`:

```powershell
flyctl secrets set FIREBASE_CLIENT_EMAIL="your-service-account-email@north-6da52.iam.gserviceaccount.com"
flyctl secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your-key...\n-----END PRIVATE KEY-----\n"
```

## Step 6: Create Dockerfile (If Not Auto-Generated)

Fly.io needs a Dockerfile. Create `Dockerfile` in the root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/ 2>/dev/null || true

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/index.js"]
```

Or create `.dockerignore`:

```
node_modules
client
.git
.env
*.md
.DS_Store
```

## Step 7: Deploy!

```powershell
flyctl deploy
```

This will:
- Build your Docker image
- Deploy to Fly.io
- Give you a URL like: `https://your-app-name.fly.dev`

## Step 8: Get Your Backend URL

After deployment, get your URL:

```powershell
flyctl status
```

Or check the Fly.io dashboard: https://fly.io/dashboard

Your backend URL will be: `https://your-app-name.fly.dev`

## Step 9: Update Frontend

1. Create `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-app-name.fly.dev
   ```

2. Rebuild and redeploy frontend:
   ```powershell
   cd client
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

## Step 10: Test

Visit `https://your-app-name.fly.dev/api/health` - should return:
```json
{"status":"OK","message":"CRM API is running"}
```

## Troubleshooting

### Check Logs
```powershell
flyctl logs
```

### SSH into Container
```powershell
flyctl ssh console
```

### Scale App
```powershell
flyctl scale count 1
```

### View App Status
```powershell
flyctl status
```

### Update Secrets
```powershell
flyctl secrets set KEY=value
```

### List Secrets
```powershell
flyctl secrets list
```

## Free Tier Limits

- ✅ 3 shared-cpu VMs
- ✅ 3GB persistent volumes
- ✅ 160GB outbound data transfer
- ✅ No credit card required for free tier

## Alternative: Simpler Setup

If Fly.io setup is too complex, consider:
- **Railway** - Easier setup, $5 free credit/month
- **Render** - Free forever, simpler configuration

See `FREE_DEPLOYMENT_GUIDE.md` for all options.

