// Supabase Service - All database operations
import { supabase } from '../lib/supabase';

// Users
export const getUser = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return { data, error };
};

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  return { data, error };
};

export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Clients
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      account_manager:users!clients_account_manager_id_fkey(id, name, email)
    `)
    .order('name');
  return { data, error };
};

export const getClient = async (clientId) => {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      account_manager:users!clients_account_manager_id_fkey(id, name, email)
    `)
    .eq('id', clientId)
    .single();
  return { data, error };
};

export const createClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();
  return { data, error };
};

export const updateClient = async (clientId, updates) => {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select()
    .single();
  return { data, error };
};

export const deleteClient = async (clientId) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  return { error };
};

// Projects
export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients!projects_client_id_fkey(id, name, client_id)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getProject = async (projectId) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients!projects_client_id_fkey(id, name, client_id)
    `)
    .eq('id', projectId)
    .single();
  return { data, error };
};

export const createProject = async (projectData) => {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();
  return { data, error };
};

export const updateProject = async (projectId, updates) => {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();
  return { data, error };
};

export const deleteProject = async (projectId) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  return { error };
};

// Tasks
export const getTasks = async (filters = {}) => {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      project:projects!tasks_project_id_fkey(id, name, project_id),
      assigned_to:users!tasks_assigned_to_id_fkey(id, name, email, department)
    `);

  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId);
  }
  if (filters.assignedTo) {
    query = query.eq('assigned_to_id', filters.assignedTo);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('due_date', { ascending: true });
  return { data, error };
};

export const getTask = async (taskId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects!tasks_project_id_fkey(id, name, project_id),
      assigned_to:users!tasks_assigned_to_id_fkey(id, name, email, department)
    `)
    .eq('id', taskId)
    .single();
  return { data, error };
};

export const createTask = async (taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();
  return { data, error };
};

export const updateTask = async (taskId, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();
  return { data, error };
};

export const deleteTask = async (taskId) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  return { error };
};

// Finance
export const getFinanceEntries = async () => {
  const { data, error } = await supabase
    .from('finance_entries')
    .select(`
      *,
      project:projects!finance_entries_project_id_fkey(id, name, project_id)
    `)
    .order('date', { ascending: false });
  return { data, error };
};

export const createFinanceEntry = async (entryData) => {
  const { data, error } = await supabase
    .from('finance_entries')
    .insert(entryData)
    .select()
    .single();
  return { data, error };
};

export const updateFinanceEntry = async (entryId, updates) => {
  const { data, error } = await supabase
    .from('finance_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select()
    .single();
  return { data, error };
};

export const deleteFinanceEntry = async (entryId) => {
  const { error } = await supabase
    .from('finance_entries')
    .delete()
    .eq('id', entryId);
  return { error };
};

// Calendar Events
export const getCalendarEvents = async (userId) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      created_by:users!calendar_events_created_by_id_fkey(id, name, email),
      assigned_to:users!calendar_events_assigned_to_id_fkey(id, name, email)
    `)
    .or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`)
    .order('start_date', { ascending: true });
  return { data, error };
};

export const createCalendarEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(eventData)
    .select()
    .single();
  return { data, error };
};

export const updateCalendarEvent = async (eventId, updates) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();
  return { data, error };
};

export const deleteCalendarEvent = async (eventId) => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);
  return { error };
};

// Conversations
export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      created_by:users!conversations_created_by_id_fkey(id, name, email)
    `)
    .contains('participants', [userId])
    .order('updated_at', { ascending: false });
  return { data, error };
};

export const createConversation = async (conversationData) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert(conversationData)
    .select()
    .single();
  return { data, error };
};

// Messages
export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(id, name, email)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const createMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();
  return { data, error };
};

// Real-time subscriptions
export const subscribeToMessages = (conversationId, callback) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToConversations = (userId, callback) => {
  return supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participants=cs.{${userId}}`,
      },
      callback
    )
    .subscribe();
};

