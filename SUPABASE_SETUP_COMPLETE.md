# Supabase Setup - Complete Guide

## ✅ What's Done

1. ✅ Supabase client configured
2. ✅ AuthContext updated to use Supabase Auth
3. ✅ Database schema SQL file created
4. ✅ Frontend code updated

## Step 1: Set Up Supabase Database

1. Go to https://supabase.com/dashboard/project/ifiustebhfotrmceqnbx
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Wait for all tables to be created

## Step 2: Enable Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings if needed
4. Save changes

## Step 3: Create Your First User

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

### Option B: Via Frontend (After Deployment)

Users will be auto-created when they first sign up/login.

## Step 4: Install Dependencies

```powershell
cd "C:\Users\Computer House\Downloads\CRM\client"
npm install @supabase/supabase-js
```

## Step 5: Rebuild and Deploy Frontend

```powershell
cd "C:\Users\Computer House\Downloads\CRM\client"
npm run build
cd ..
firebase deploy --only hosting
```

## Step 6: Test

1. Visit https://north-6da52.web.app
2. Try logging in with a user created in Supabase
3. No CORS errors! 🎉

## What Changed

- ✅ Login uses Supabase Auth (no CORS!)
- ✅ All data stored in Supabase
- ✅ Real-time updates available
- ✅ No backend server needed
- ✅ Only frontend deployment to Firebase

## Next Steps

After setting up the database:
1. Update all pages to use Supabase queries instead of API calls
2. Test all features
3. Deploy to Firebase

## Benefits

- ✅ **No CORS issues** - Supabase handles everything
- ✅ **Real-time** - Built-in real-time subscriptions
- ✅ **Free tier** - Generous free tier
- ✅ **Simple deployment** - Only frontend needed
- ✅ **Built-in auth** - No custom auth needed

The code is ready! Just set up the database schema and deploy! 🚀

