-- Supabase Database Schema for CRM System
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
-- Note: id should match Supabase auth.users id
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS clients (
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
CREATE TABLE IF NOT EXISTS projects (
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
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  assigned_to_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'To Do',
  priority TEXT DEFAULT 'Medium',
  due_date DATE,
  notes JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance entries table
CREATE TABLE IF NOT EXISTS finance_entries (
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
CREATE TABLE IF NOT EXISTS calendar_events (
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
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  participants UUID[] NOT NULL,
  created_by_id UUID REFERENCES users(id),
  last_message JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_finance_project ON finance_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_created_by ON calendar_events(created_by_id);
CREATE INDEX IF NOT EXISTS idx_calendar_assigned_to ON calendar_events(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read all clients" ON clients;
DROP POLICY IF EXISTS "Users can read all projects" ON projects;
DROP POLICY IF EXISTS "Users can read tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read finance" ON finance_entries;
DROP POLICY IF EXISTS "Users can read calendar" ON calendar_events;
DROP POLICY IF EXISTS "Users can read conversations" ON conversations;
DROP POLICY IF EXISTS "Users can read messages" ON messages;

-- Create policies for authenticated users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read all clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read all projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read finance" ON finance_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read calendar" ON calendar_events
  FOR SELECT USING (
    auth.uid() = created_by_id OR 
    auth.uid() = assigned_to_id OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can read conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid() = ANY(conversations.participants)
    )
  );

-- Allow authenticated users to insert/update/delete (you can restrict this later)
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tasks" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage finance" ON finance_entries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage calendar" ON calendar_events
  FOR ALL USING (
    auth.uid() = created_by_id OR 
    auth.uid() = assigned_to_id
  );

CREATE POLICY "Users can manage conversations" ON conversations
  FOR ALL USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can manage messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid() = ANY(conversations.participants)
    )
  );

