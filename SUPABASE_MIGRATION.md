# Supabase Migration Guide

## Overview

Migrating from Express backend to Supabase for:
- ✅ No CORS issues (Supabase handles everything)
- ✅ Real-time database
- ✅ Built-in authentication
- ✅ Serverless functions (Edge Functions)
- ✅ Deploy only frontend to Firebase

## Step 1: Set Up Supabase Database Schema

Go to https://supabase.com/dashboard/project/ifiustebhfotrmceqnbx

### Create Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'Team Member',
  department TEXT,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_info JSONB,
  industry TEXT,
  contract_date DATE,
  account_manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  category TEXT,
  status TEXT DEFAULT 'Planning',
  start_date DATE,
  end_date DATE,
  estimated_budget DECIMAL,
  actual_cost DECIMAL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  assigned_to_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'To Do',
  priority TEXT DEFAULT 'Medium',
  due_date DATE,
  notes JSONB,
  deliverables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance entries table
CREATE TABLE finance_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  project_id UUID REFERENCES projects(id),
  description TEXT,
  date DATE,
  payment_deadline DATE,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by_id UUID REFERENCES users(id),
  assigned_to_id UUID REFERENCES users(id),
  type TEXT DEFAULT 'personal',
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  participants UUID[] NOT NULL,
  created_by_id UUID REFERENCES users(id),
  last_message JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  attachments JSONB,
  read_by UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users to read their own data)
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can read all clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can read all projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can read tasks assigned to them" ON tasks FOR SELECT USING (auth.uid()::text = assigned_to_id::text OR auth.role() = 'authenticated');
```

## Step 2: Set Up Supabase Authentication

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable Email provider
3. Configure email templates if needed

## Step 3: Create Supabase Functions (Edge Functions)

For complex operations, create Edge Functions in Supabase.

## Step 4: Update Frontend

The frontend code is being updated to use Supabase instead of the Express API.

## Step 5: Deploy

Only deploy frontend to Firebase - no backend needed!

```bash
cd client
npm run build
cd ..
firebase deploy --only hosting
```

## Benefits

- ✅ No CORS issues
- ✅ Real-time updates
- ✅ Built-in auth
- ✅ Serverless
- ✅ Free tier available
- ✅ Only frontend deployment needed

